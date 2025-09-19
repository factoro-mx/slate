const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// Initialize Secrets Manager client for us-east-1 (required for Lambda@Edge)
const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

exports.handler = async (event) => {
    console.log('Lambda@Edge function started');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const request = event.Records[0].cf.request;
    const headers = request.headers;
    const uri = request.uri;
    
    console.log('URI:', uri);
    console.log('Headers:', JSON.stringify(headers, null, 2));

    try {
        // Determine which credentials to fetch based on path
        let secretName = null;
        let realm = null;

        if (uri.startsWith('/buyers/') || uri === '/buyers') {
            secretName = 'factoro/docs/buyers-credentials';
            realm = 'Buyers Documentation';
        } else if (uri.startsWith('/financial_institutions/') || uri === '/financial_institutions') {
            secretName = 'factoro/docs/fi-credentials';
            realm = 'Financial Institutions Documentation';
        }

        console.log('Secret name:', secretName);
        console.log('Realm:', realm);

        if (secretName) {
            console.log('Fetching credentials from Secrets Manager...');
            
            // Fetch credentials from Secrets Manager using AWS SDK v3
            const command = new GetSecretValueCommand({
                SecretId: secretName
            });

            const result = await secretsClient.send(command);
            console.log('Secrets Manager response received');
            
            const secretData = JSON.parse(result.SecretString);
            console.log('Secret data parsed:', Object.keys(secretData));

            // Credentials can be stored as array in 'credentials' field
            const credentials = secretData.credentials || [];
            console.log('Credentials count:', credentials.length);

            // Extract provided auth
            let providedAuth = null;
            if (headers.authorization && headers.authorization[0]) {
                const authValue = headers.authorization[0].value;
                if (authValue.startsWith('Basic ')) {
                    providedAuth = authValue.substring(6);
                    console.log('Provided auth found:', providedAuth ? 'YES' : 'NO');
                }
            } else {
                console.log('No authorization header found');
            }

            // Check if provided credentials match any allowed ones
            let isAuthenticated = false;
            if (providedAuth && credentials.includes(providedAuth)) {
                isAuthenticated = true;
                console.log('Authentication: SUCCESS');
            } else {
                console.log('Authentication: FAILED');
            }

            if (!isAuthenticated) {
                console.log('Returning 401 response');
                const response = {
                    status: '401',
                    statusDescription: 'Unauthorized',
                    headers: {
                        'www-authenticate': [{
                            key: 'WWW-Authenticate',
                            value: `Basic realm="${realm}"`
                        }],
                        'content-type': [{
                            key: 'Content-Type',
                            value: 'text/html; charset=utf-8'
                        }],
                        'cache-control': [{
                            key: 'Cache-Control',
                            value: 'no-store'
                        }]
                    },
                    body: `<!DOCTYPE html><html><head><title>Authentication Required</title><style>body{font-family:Arial,sans-serif;text-align:center;margin-top:100px;}</style></head><body><h1>🔐 Authentication Required</h1><p>Please provide your credentials to access this documentation.</p><p><strong>Realm:</strong> ${realm}</p></body></html>`
                };
                return response;
            }
        }
        
        console.log('Authentication passed or not required, continuing with request');
        return request;
        
    } catch (error) {
        console.error('ERROR in Lambda@Edge function:', error);
        console.error('Error stack:', error.stack);
        
        // Fallback to deny access if secret fetch fails
        return {
            status: '500',
            statusDescription: 'Internal Server Error',
            headers: {
                'content-type': [{
                    key: 'Content-Type',
                    value: 'text/html; charset=utf-8'
                }]
            },
            body: '<!DOCTYPE html><html><head><title>Service Error</title><style>body{font-family:Arial,sans-serif;text-align:center;margin-top:100px;}</style></head><body><h1>⚠️ Authentication Service Unavailable</h1><p>Please try again later or contact support.</p></body></html>'
        };
    }
};

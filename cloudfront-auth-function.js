function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var uri = request.uri;

  // Define multiple authentication credentials per section
  // Each section can have multiple valid username:password combinations
  var buyersCredentials = [];

  var fiCredentials = [];

  // Check if the request is for a protected path and determine required auth
  var allowedCredentials = null;
  var realm = null;

  if (uri.startsWith("/buyers/") || uri === "/buyers") {
    allowedCredentials = buyersCredentials;
    realm = "Buyers Documentation";
  } else if (
    uri.startsWith("/financial_institutions/") ||
    uri === "/financial_institutions"
  ) {
    allowedCredentials = fiCredentials;
    realm = "Financial Institutions Documentation";
  }

  // If authentication is required for this path
  if (allowedCredentials) {
    var authHeader = headers.authorization;
    var providedAuth = null;

    // Extract the Base64 credentials from the Authorization header
    if (authHeader && authHeader.value) {
      var authValue = authHeader.value;
      if (authValue.startsWith("Basic ")) {
        providedAuth = authValue.substring(6); // Remove "Basic " prefix
      }
    }

    // Check if the provided credentials match any of the allowed ones
    var isAuthenticated = false;
    if (providedAuth) {
      for (var i = 0; i < allowedCredentials.length; i++) {
        if (providedAuth === allowedCredentials[i]) {
          isAuthenticated = true;
          break;
        }
      }
    }

    if (!isAuthenticated) {
      // Return 401 with WWW-Authenticate header to trigger browser login dialog
      return {
        statusCode: 401,
        statusDescription: "Unauthorized",
        headers: {
          "www-authenticate": {
            value: 'Basic realm="' + realm + '"',
          },
          "content-type": {
            value: "text/html; charset=utf-8",
          },
          "cache-control": {
            value: "no-store",
          },
        },
        body: {
          encoding: "text",
          data:
            "<!DOCTYPE html><html><head><title>Authentication Required</title><style>body{font-family:Arial,sans-serif;text-align:center;margin-top:100px;}</style></head><body><h1>🔐 Authentication Required</h1><p>Please provide your credentials to access this documentation.</p><p><strong>Realm:</strong> " +
            realm +
            "</p></body></html>",
        },
      };
    }
  }

  // Authentication passed or not required, continue with request
  return request;
}

/*
Multiple User Authentication Support

Current credentials (change these for production!):

BUYERS SECTION - Multiple users supported:
1. Username: buyer_user / Password: buyer_password
   Base64: YnV5ZXJfdXNlcjpidXllcl9wYXNzd29yZA==

2. Username: buyer1 / Password: buyer123
   Base64: YnV5ZXIxOmJ1eWVyMTIz

3. Username: buyer2 / Password: buyer456
   Base64: YnV5ZXIyOmJ1eWVyNDU2

FINANCIAL INSTITUTIONS SECTION - Multiple users supported:
1. Username: fi_admin / Password: fi_password
   Base64: ZmlfYWRtaW46ZmlfcGFzc3dvcmQ=

2. Username: bank1 / Password: bank123
   Base64: YmFuazE6YmFuazEyMw==

3. Username: bank2 / Password: bank456
   Base64: YmFuazI6YmFuazQ1Ng==

TO ADD MORE USERS:
1. Generate Base64 for new credentials:
   echo -n "username:password" | base64

2. Add the Base64 string to the appropriate credentials array

3. Republish the CloudFront Function

EXAMPLE - Adding a new buyer:
   echo -n "buyer3:newpassword" | base64
   # Result: YnV5ZXIzOm5ld3Bhc3N3b3Jk
   # Add 'YnV5ZXIzOm5ld3Bhc3N3b3Jk' to buyersCredentials array

SECURITY NOTES:
- Each section can have unlimited users
- All users in a section have the same access level
- Users cannot access other sections (buyers can't access FI docs)
- Credentials are validated against the entire array for that section
- Browser handles authentication UI automatically
*/

# Factoro API Documentation - Deployment Guide

This guide explains how to deploy the multi-user Factoro API documentation with HTTP Basic Authentication using `.htaccess` files.

## Architecture Overview

The documentation is split into two user types:
- **Buyers**: Access via `/buyers/` URL
- **Financial Institutions**: Access via `/financial_institutions/` URL

Each user type has separate HTTP Basic Authentication and cannot access the other's documentation without separate credentials.

## Authentication Method: HTTP Basic Authentication

This approach uses standard `.htaccess` files with HTTP Basic Authentication.

**Pros:**
- Simple and widely supported
- Secure password encryption (bcrypt/MD5)
- No JavaScript required
- Works with any web server that supports .htaccess
- Easy to manage and update passwords
- No additional AWS services needed

**Cons:**
- Passwords are transmitted with each request (over HTTPS this is secure)
- Browser may cache credentials
- Basic authentication dialog (not as polished as custom forms)

**How it works:**
1. User visits `/buyers/` or `/financial_institutions/`
2. Web server reads `.htaccess` file and prompts for credentials
3. Server validates against `.htpasswd` file
4. Access granted for valid credentials

## Deployment Steps

### 1. Generate Password Files

```bash
# Run the password generation script
./generate-passwords.sh

# This will create:
# - .htpasswd-buyers
# - .htpasswd-financial-institutions
```

**🚨 SECURITY WARNING:** 
- **NEVER commit `.htpasswd` files to Git/GitHub**
- These files are automatically ignored by `.gitignore`
- Always upload them manually to your server
- Store them outside your web document root when possible

### 2. Build the Documentation

```bash
# Build the documentation
bundle exec middleman build --clean

# The build/ directory now contains:
# - build/index.html (landing page)
# - build/buyers/index.html (buyers documentation)
# - build/buyers/.htaccess (authentication config)
# - build/financial_institutions/index.html (FI documentation)
# - build/financial_institutions/.htaccess (authentication config)
```

### 3. Deploy to Web Server

#### Option A: Apache/Nginx with .htaccess support

```bash
# Upload files to your web server
rsync -av build/ user@your-server.com:/var/www/html/docs/

# Upload password files (keep these secure!)
scp .htpasswd-buyers user@your-server.com:/var/www/.htpasswd-buyers
scp .htpasswd-financial-institutions user@your-server.com:/var/www/.htpasswd-financial-institutions

# Set proper permissions
ssh user@your-server.com "chmod 644 /var/www/.htpasswd-*"
```

#### Option B: S3 with CloudFront (Alternative)

Note: S3 doesn't support .htaccess files directly, but you can use CloudFront with Lambda@Edge for similar functionality.

```bash
# Upload to S3 (without .htaccess files)
aws s3 sync build/ s3://docs.factoro.mx --exclude "*.htaccess"
```

### 4. Configure Web Server

#### Apache Configuration

Ensure your Apache server has the following modules enabled:
```bash
sudo a2enmod auth_basic
sudo a2enmod authz_user
sudo a2enmod headers
sudo systemctl restart apache2
```

Make sure `.htaccess` files are allowed in your virtual host:
```apache
<Directory "/var/www/html/docs">
    AllowOverride All
    Options Indexes FollowSymLinks
    Require all granted
</Directory>
```

#### Nginx Configuration

If using Nginx, you'll need to configure HTTP Basic Auth in the server config:

```nginx
location /docs/buyers/ {
    auth_basic "Factoro API Documentation - Buyers";
    auth_basic_user_file /var/www/.htpasswd-buyers;
    try_files $uri $uri/ /docs/buyers/index.html;
}

location /docs/financial_institutions/ {
    auth_basic "Factoro API Documentation - Financial Institutions";
    auth_basic_user_file /var/www/.htpasswd-financial-institutions;
    try_files $uri $uri/ /docs/financial_institutions/index.html;
}
```

## Access URLs

After deployment, users can access:

- **Landing Page**: `https://docs.factoro.mx/`
- **Buyers Documentation**: `https://docs.factoro.mx/buyers/` (requires authentication)
- **Financial Institutions**: `https://docs.factoro.mx/financial_institutions/` (requires authentication)

## Managing Passwords

### Updating Passwords

To change passwords:

1. **Generate new password file:**
```bash
# For buyers
htpasswd -c .htpasswd-buyers buyer-username

# For financial institutions  
htpasswd -c .htpasswd-financial-institutions fi-username
```

2. **Upload updated files:**
```bash
scp .htpasswd-buyers user@your-server.com:/var/www/.htpasswd-buyers
scp .htpasswd-financial-institutions user@your-server.com:/var/www/.htpasswd-financial-institutions
```

### Adding Multiple Users

To add additional users to the same documentation:

```bash
# Add another buyer user (don't use -c flag to append)
htpasswd .htpasswd-buyers another-buyer-user

# Add another FI user
htpasswd .htpasswd-financial-institutions another-fi-user
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS to protect credentials in transit
2. **Strong Passwords**: Use strong, unique passwords for each user type
3. **File Permissions**: Keep .htpasswd files readable only by web server
4. **Location**: Store .htpasswd files outside web root if possible
5. **Regular Updates**: Change passwords periodically
6. **Access Logs**: Monitor web server logs for unauthorized access attempts

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**: 
   - Check .htpasswd file path in .htaccess
   - Verify file permissions (644 for .htpasswd)
   - Ensure web server can read the password file

2. **500 Internal Server Error**:
   - Check if .htaccess is allowed (AllowOverride All)
   - Verify Apache modules are enabled
   - Check error logs: `tail -f /var/log/apache2/error.log`

3. **Authentication Not Working**:
   - Test password file: `htpasswd -v .htpasswd-buyers username`
   - Check file paths are absolute in .htaccess
   - Verify web server supports HTTP Basic Auth

### Debug Commands:

```bash
# Test password file
htpasswd -v .htpasswd-buyers your-username

# Check Apache modules
apache2ctl -M | grep auth

# Test .htaccess syntax
apache2ctl configtest

# View error logs
tail -f /var/log/apache2/error.log
```

## Cost Estimation

- **Traditional Web Hosting**: $5-20/month
- **VPS/Cloud Server**: $10-50/month  
- **S3 + CloudFront** (if you go that route): $1-10/month

Much more cost-effective than Lambda@Edge solutions!

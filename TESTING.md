# Quick Test Guide

## Testing .htaccess Authentication Locally

### Prerequisites
- Apache web server installed locally
- `htpasswd` command available

### Quick Setup

1. **Generate test passwords:**
```bash
./generate-passwords.sh
```

2. **Build the documentation:**
```bash
bundle exec middleman build --clean
```

3. **Set up local Apache:**
```bash
# Copy build files to Apache document root
sudo cp -r build/* /var/www/html/

# Copy password files
sudo cp .htpasswd-buyers /var/www/
sudo cp .htpasswd-financial-institutions /var/www/

# Ensure .htaccess is allowed in Apache config
# Edit /etc/apache2/sites-available/000-default.conf
# Add: AllowOverride All
```

4. **Test the setup:**
- Visit `http://localhost/` (should show landing page)
- Visit `http://localhost/buyers/` (should prompt for authentication)
- Visit `http://localhost/financial_institutions/` (should prompt for authentication)

### Alternative: Simple Python Server Test

For a quick test without Apache:

```bash
cd build
python3 -m http.server 8000
# Visit http://localhost:8000
# Note: This won't test .htaccess authentication
```

## File Structure After Build

```
build/
├── index.html (landing page)
├── buyers/
│   ├── index.html (buyers documentation)
│   └── .htaccess (buyers auth config)
├── financial_institutions/
│   ├── index.html (FI documentation)
│   └── .htaccess (FI auth config)
└── ... (other assets)
```

## Expected User Experience

1. **Landing page**: Clean interface with two options
2. **Buyers section**: Browser prompts for username/password
3. **Financial institutions section**: Browser prompts for username/password (different credentials)
4. **Cross-access prevention**: Buyers credentials won't work for FI section and vice versa

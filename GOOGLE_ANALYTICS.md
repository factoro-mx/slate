# Google Analytics Setup Guide

This guide explains how to add Google Analytics tracking to your Factoro API documentation.

## Prerequisites

1. **Google Analytics 4 Account**: Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. **Measurement ID**: Get your GA4 Measurement ID (format: `G-XXXXXXXXXX`)

## Configuration Methods

### Method 1: Environment Variable (Recommended)

Set your Google Analytics ID as an environment variable:

```bash
# For development/local testing
export GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# For production deployment
# Add to your server's environment variables or hosting platform
```

### Method 2: Direct Configuration

Edit `config.rb` and replace the `nil` value:

```ruby
# Replace this line in config.rb:
set :google_analytics_id, ENV['GOOGLE_ANALYTICS_ID'] || nil

# With your actual Measurement ID:
set :google_analytics_id, ENV['GOOGLE_ANALYTICS_ID'] || "G-XXXXXXXXXX"
```

## What Gets Tracked

The implementation automatically tracks:

### Standard Metrics
- **Page views** on all documentation pages
- **User sessions** and session duration
- **Bounce rate** and user engagement
- **Traffic sources** (direct, referral, search, etc.)

### Custom Events
- **User Type Identification**:
  - `buyers` - Users viewing buyers documentation
  - `financial_institutions` - Users viewing FI documentation
- **Section Tracking**:
  - `buyers_documentation` - Buyers section visits
  - `fi_documentation` - Financial institutions section visits

### Enhanced Measurements
- **File downloads** (if you add downloadable files)
- **Outbound link clicks**
- **Scroll tracking**
- **Site search** (if enabled)

## Testing Your Setup

### 1. Verify Installation

1. **Set your GA ID**:
   ```bash
   export GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
   ```

2. **Build and serve locally**:
   ```bash
   bundle exec middleman build --clean
   bundle exec middleman server
   ```

3. **Check browser developer tools**:
   - Open Network tab
   - Visit `http://localhost:4567/buyers/`
   - Look for requests to `google-analytics.com` or `googletagmanager.com`

### 2. Real-Time Testing

1. **Visit your live site** with GA enabled
2. **Open Google Analytics** → Reports → Realtime
3. **Navigate through documentation sections**
4. **Verify user activity** appears in real-time

## Custom Event Tracking

You can add more custom tracking by adding JavaScript to your pages:

```javascript
// Track specific documentation interactions
gtag('event', 'api_endpoint_view', {
  'endpoint_name': 'create_credit_line',
  'user_type': 'financial_institutions'
});

// Track authentication events (add to .htaccess success)
gtag('event', 'documentation_access', {
  'method': 'http_basic_auth',
  'user_type': 'buyers'
});
```

## Privacy and Compliance

### GDPR Compliance
Consider adding a cookie consent banner if you have EU users:

```html
<!-- Add to layout.erb if needed -->
<script>
  // Disable GA until user consents
  window['ga-disable-G-XXXXXXXXXX'] = true;
  
  // Enable after consent
  function enableGA() {
    window['ga-disable-G-XXXXXXXXXX'] = false;
    gtag('config', 'G-XXXXXXXXXX');
  }
</script>
```

### Data Retention
Configure data retention in GA4:
1. **Go to Admin** → Data Settings → Data Retention
2. **Set retention period** (2 months to 50 months)
3. **Configure user data** retention policies

## Useful Reports

### 1. User Type Analysis
- **Audience** → Demographics → Custom Dimensions
- **Filter by** `user_type` to see buyers vs. FI users

### 2. Documentation Usage
- **Behavior** → Site Content → All Pages
- **Filter by** `/buyers/` and `/financial_institutions/` paths

### 3. Authentication Success
- **Events** → All Events
- **Look for** `documentation_access` events

## Troubleshooting

### Common Issues

1. **No data appearing**:
   - Verify Measurement ID format (`G-XXXXXXXXXX`)
   - Check browser ad blockers
   - Ensure GA4 property is created (not Universal Analytics)

2. **Custom events not tracking**:
   - Check browser console for JavaScript errors
   - Verify event syntax in gtag calls

3. **Development vs. Production**:
   - GA is disabled when `google_analytics_id` is `nil`
   - Use environment variables to control per-environment

### Debug Mode

Enable GA4 debug mode for testing:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  debug_mode: true
});
```

## Security Notes

- **Never commit** GA IDs directly to public repositories
- **Use environment variables** for sensitive configuration
- **Consider user privacy** and implement consent mechanisms if required
- **Monitor data access** in Google Analytics Admin panel

## 📧 SMTP Configuration Guide

### Problem: Email timeout on deployment

The backend is failing to send password reset emails on deployment due to SMTP timeout errors.

### Solutions Implemented:

1. **Enhanced SMTP Configuration**
   - Added connection timeouts (10s, 5s, 15s)
   - Added TLS configuration for deployment platforms
   - Added connection pooling for better reliability

2. **Better Error Handling**
   - Specific error messages for different failure types
   - Logging for debugging deployment issues
   - Connection verification on startup

### Environment Variables Needed:

```env
# Required SMTP settings
SMTP_HOST=smtp.gmail.com          # or your SMTP server
SMTP_PORT=587                     # 587 for TLS, 465 for SSL
SMTP_USER=your-email@gmail.com    # sending email address  
SMTP_PASS=your-app-password       # app password (not regular password)
EMAIL_FROM="AutoNova <noreply@autonova.cz>"
```

### Recommended SMTP Providers:

1. **Gmail** (Free tier: 100 emails/day)
   - SMTP_HOST=smtp.gmail.com
   - SMTP_PORT=587
   - Requires app password (not regular password)

2. **SendGrid** (Free tier: 100 emails/day)
   - SMTP_HOST=smtp.sendgrid.net
   - SMTP_PORT=587
   - User: apikey
   - Pass: your-sendgrid-api-key

3. **Mailgun** (Free tier: 5000 emails/month)
   - SMTP_HOST=smtp.eu.mailgun.org
   - SMTP_PORT=587

### Deployment Platform Considerations:

- **Railway/Render**: Usually works with all providers
- **Vercel**: SMTP might be blocked, consider API-based services
- **Heroku**: Works well with SendGrid addon

### Testing:

```bash
# Test SMTP connection
curl -X POST http://localhost:3001/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Troubleshooting:

1. Check environment variables are set correctly
2. Verify SMTP credentials with email provider  
3. Check deployment platform firewall/port restrictions
4. Consider switching to API-based email service (SendGrid, Mailgun)
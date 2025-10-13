## 🚂 Railway SMTP Setup Guide

### Problém: Connection timeout na Railway

Railway **blokuje odchozí SMTP připojení** na portech 587/25 ze security důvodů.

### ✅ Řešení:

1. **Použít SSL port 465 místo TLS port 587**
2. **Nastavit environment variables na Railway**

### 📋 Railway Environment Variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=cartaczcontact@gmail.com  
SMTP_PASS=royswfvqzvunlcni
EMAIL_FROM="AutoNova <noreply@autonova.cz>"
```

### 🔧 Jak nastavit na Railway:

1. Otevřete Railway dashboard
2. Klikněte na váš projekt
3. Přejděte na **Variables** tab  
4. Přidejte jednotlivě všechny proměnné výše

### 🧪 Test:

Po nasazení zkontrolujte logy:
```
🔧 SMTP Config: smtp.gmail.com:465 (secure: true)
✅ SMTP connection verified successfully
```

Místo:
```
❌ SMTP connection failed: ETIMEDOUT
```

### 🔄 Alternativní řešení:

Pokud port 465 také nefunguje:

1. **SendGrid** (doporučeno pro Railway):
   ```bash
   SENDGRID_API_KEY=your_key
   ```

2. **Mailgun API**
3. **Resend API** 
4. **Postmark API**

### 📧 Gmail App Password:

Ujistěte se, že používáte **App Password** ne regular password:
1. https://myaccount.google.com/apppasswords
2. Vygenerujte nový App Password pro "Mail"
3. Použijte tento password v `SMTP_PASS`
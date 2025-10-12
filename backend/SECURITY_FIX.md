# 🔒 CRITICAL SECURITY FIX - Password Hash Exposure

## ⚠️ **Problém**
Backend API vystavovalo **password hash** a další citlivá data uživatelů v public API odpovědích.

**Příklad problému:**
```bash
curl "https://autonova-production.up.railway.app/ad?search=skoda&page=1&limit=12"
```

**Vrácelo:**
```json
{
  "user": {
    "id": "7643f685-8361-4b39-a5b6-6b249adb6259",
    "email": "user@example.com", 
    "password": "$2b$10$yQ7bMqdpH9Q....HASH....",  // ❌ KRITICKÁ CHYBA
    "name": "John Doe",
    "isDealer": true,
    "dealerTier": "BASIC",
    "createdAt": "2025-09-24T15:59:51.282Z"
  }
}
```

## ✅ **Oprava implementována**

### **1. AdService - Bezpečná user projekce**
```typescript
// 🔒 SECURITY: Safe user projection - NEVER include password or sensitive data
private readonly safeUserSelect = {
  id: true,
  name: true,
  isDealer: true,
  dealerTier: true,
  role: true,
  // ❌ NEVER INCLUDE: password, email, createdAt, updatedAt, tierUpgradedAt
}
```

### **2. Všechny ad.service metody opraveny:**
- `findAll()` - veřejný listing inzerátů
- `findOne()` - detail inzerátu  
- `searchAds()` - vyhledávání
- `create()` - vytvoření inzerátu
- `update()` - editace inzerátu

**Před:**
```typescript
include: { user: true }  // ❌ Vrací vše včetně hesla
```

**Po:**
```typescript
include: { 
  user: {
    select: this.safeUserSelect  // ✅ Pouze bezpečné údaje
  }
}
```

### **3. UserService opraveno**
```typescript
async findOne(id: string) {
  const user = await this.prisma.user.findUnique({
    select: {
      id: true,
      name: true,
      isDealer: true,
      dealerTier: true,
      role: true,
      // ❌ SECURITY: Never include password, email, createdAt
      ads: { /* safe ads projection */ }
    }
  })
}
```

### **🛡️ Co je nyní bezpečné**

### **Veřejné API odpovědi obsahují jen:**
- `id` - UUID uživatele
- `name` - jméno/název 
- `isDealer` - pouze pro UI (dealer badge)

### **Co se NIKDY nevrací:**
- ❌ `password` - hash hesla
- ❌ `email` - emailová adresa
- ❌ `createdAt` - kdy se registroval
- ❌ `updatedAt` - poslední změna
- ❌ `tierUpgradedAt` - upgrade dealera
- ❌ `dealerTier` - úroveň dealera (business data)
- ❌ `role` - uživatelská role (business data)

## 🔍 **Kontrolované soubory**

### **✅ Opraveno:**
- `backend/src/ad/ad.service.ts` - všechny metody
- `backend/src/user/user.service.ts` - findOne metoda

### **✅ Již bylo bezpečné:**
- `backend/src/auth/auth.service.ts` - login/register
- `backend/src/user/user.service.ts` - create metoda

### **✅ Dodatečně opraveno:**
- `backend/src/user/user.service.ts` - přidána `findOneWithPassword()` pro auth
- Minimalizace veřejných dat - odebrání `dealerTier` a `role`

## 🚀 **Nasazení**

**URGENT:** Tyto změny je třeba nasadit OKAMŽITĚ do produkce!

```bash
# Build a deploy
npm run build
# Deploy to Railway/production
```

## 📋 **Dodatečná doporučení**

### **1. Audit dalších endpointů**
Zkontrolovat všechny API endpointy zda nevystavují citlivá data:
- Review systém
- Admin endpointy  
- Contact formuláře
- Saved ads

### **2. Add response sanitization**
```typescript
// Přidat obecný sanitizer
function sanitizeUser(user: any) {
  const { password, email, createdAt, ...safe } = user
  return safe
}
```

### **3. Add tests**
```typescript
// Test že API nevrací citlivé údaje
it('should not expose password in ad responses', async () => {
  const response = await request.get('/ad')
  expect(response.body.users).not.toHaveProperty('password')
})
```

### **4. Environment check**
- Přidat monitoring pro detekci citlivých dat v responses
- Log security events
- Regular security audits

## ⚡ **Impact**
- **Kritická zranitelnost** - password hashe vystavené veřejně
- **GDPR compliance** - neoprávněné zpracování osobních údajů
- **Privacy violation** - emailové adresy, registrační data
- **Attack surface** - hashe použitelné pro offline útoky

**Status: 🔒 FIXED - Ready for immediate deployment**
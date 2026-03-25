# MATURITNÍ DOKUMENTACE

## TITULNÍ LIST

---

**STŘEDNÍ ŠKOLA INFORMAČNÍCH TECHNOLOGIÍ**

*Třída: 4. třída IT*

*Školní rok: 2025/2026*

---

# AUTONOVA - MODERNÍ WEBOVÁ APLIKACE PRO SPRÁVU AUTOBAZARU

**Maturitní projekt**

Vypracoval: [Vaše jméno]

Třída: 4. IT

Rok: 2026

Vedoucí práce: [Jméno vedoucího]

---

## ZADÁNÍ MATURITNÍ PRÁCE

[Tato stránka bude obsahovat oficiální zadání potvrzené školou. Prosím vložte zadání zde.]

---

## ČESTNÉ PROHLÁŠENÍ

Prohlašuji tímto, že jsem tuto maturitní práci vypracoval samostatně a že jsem v ní uvedl veškeré používané zdroje. Veškeré informace v práci jsou získány z citovaných zdrojů nebo vlastního poznání. Práce nebyla dosud zveřejněna ani předložena k jinému účelu.

Místo a datum: _________________________

Podpis: _________________________

---

## PODĚKOVÁNÍ

Děkuji svému vedoucímu práce [jméno vedoucího] za cenné rady, konzultace a věcné připomínky během vypracování projektu. Dále děkuji svým kolegům a kolegyním za jejich zpětnou vazbu a konstruktivní kritiku.

---

## RESUMÉ A KLÍČOVÁ SLOVA

### Česky

Předmětem maturitní práce je vývoj a realizace webové aplikace AutoNova, která slouží jako moderní platforma pro správu a distribuci inzerátů autobazaru. Aplikace byla koncipována jako plně funkční systém, který umožňuje uživatelům procházet inzeráty vozidel, vytvářet vlastní inzeráty, spravovat uložená vozidla a komunikovat se prodávajícími.

Aplikace byla původně vyvíjena jako cloudová řešení s využitím PostgreSQL a cloudového úložiště Supabase. V rámci maturitní práce byla transformována na lokální řešení s JSON databází, aby byla vhodná pro demonstraci a testování bez závislosti na externích službách. 

Technologický stack obsahuje NestJS pro backend, Next.js 15 pro frontend a implementuje moderní principy webového vývoje včetně server-side renderingu, API-first architektury a role-based access control (RBAC).

Práce se zabývá návrhem architektury systému, implementací klíčových funkcí, bezpečností autentifikace a autorizace, optimalizací výkonu a kompletní dokumentací API.

**Klíčová slova:** webová aplikace, autobazar, NestJS, Next.js, JSON databáze, API, autentifikace, RBAC, full-stack vývoj

### English

The subject of this thesis is the development and implementation of the AutoNova web application, which serves as a modern platform for managing and distributing car dealership listings. The application was designed as a fully functional system that enables users to browse vehicle advertisements, create their own listings, manage saved vehicles, and communicate with sellers.

The application was originally developed as a cloud solution using PostgreSQL and Supabase cloud storage. As part of the thesis work, it was transformed into a local solution with a JSON database to be suitable for demonstration and testing without dependency on external services.

The technology stack includes NestJS for the backend, Next.js 15 for the frontend, and implements modern web development principles including server-side rendering, API-first architecture, and role-based access control (RBAC).

The work addresses system architecture design, implementation of key features, authentication and authorization security, performance optimization, and complete API documentation.

**Keywords:** web application, car dealership, NestJS, Next.js, JSON database, API, authentication, RBAC, full-stack development

---

## OBSAH

1. Úvod
2. Teoretická část
   2.1 Rešerše současného stavu
   2.2 Zmapování problému
   2.3 Vymezení cílů práce
   2.4 Zdůvodnění výběru technologií
3. Metodika a řešení
   3.1 Návrh architektury systému
   3.2 Datový model
   3.3 API Endpoints
   3.4 Frontend architektura
   3.5 Bezpečnost a autentifikace
   3.6 Implementace klíčových modulů
4. Výsledky
   4.1 Vytvořená funkcionalita
   4.2 Nasazení a spouštění
   4.3 Testování
5. Diskuse
   5.1 Zdůvodnění vybraného řešení
   5.2 Srovnání s alternativními řešeními
   5.3 Přínosy a limity
   5.4 Výzvy během vývoje
6. Závěr
7. Literatura
8. Seznam obrázků, tabulek a grafů
9. Přílohy

---

# 1. ÚVOD

## 1.1 Vymezení problému

Trh autobazarů v České republice se tradičně řídil zastaralými metodami prodeje a inzerování automobilů. Fyzické bazary, inzerátní portály s nepřehledným designem a nízkou interaktivitou se staly hlavní bariérou pro efektivní nákup a prodej vozidel. Zejména malí a střední prodejci postrádali dostupnou platformu, která by jim umožňovala jednoduše a bez vysokých nákladů inzerovat svá vozidla.

Problém lze rozdělit do následujících kategorií:

**Nedostatečná digitalizace:** Mnohé autobazary stále spoléhají na fyzické katalogy a nekvalitní webové prezentace, které neatrahují moderní kupující. Chybí jednotné rozhraní pro prohlížení vozidel z jednoho místa.

**Nízká kvalita dat:** Inzeráty vozidel často obsahují nekompletní informace, nekvalitní fotografie a chybí možnost ověření prodávajícího a historii jeho transakcí.

**Slabá komunikace mezi stranami:** Komunikace mezi kupujícím a prodávajícím je často zbytečně komplikovaná, bez integrovaného systému pro kontakt a správu dotazů.

**Vysoké náklady na infrastrukturu:** Malé bazary nemohou si dovolit vlastní IT infrastrukturu, což je vytlačuje z digitálního trhu.

Tyto problémy vytvářejí příležitost pro vývoj inteligentnímu, moderní a dostupné platformy, která by demokratizovala trh autobazarů a zlepšila zážitek jak pro kupující, tak pro prodávající.

## 1.2 Cíl práce

Primárním cílem maturitní práce je navrhnout, implementovat a zdokumentovat plně funkční webovou aplikaci pro správu autobazaru s následujícími charakteristikami:

1. **Umožnit prodejcům:**
   - Snadné vytváření a správu inzerátů vozidel
   - Nahrávání kvalitních fotografií s možností uspořádání
   - Správu kontaktních informací a dynamického ceny
   - Sledování statistik inzerátů (počet zobrazení, zájem)

2. **Umožnit kupujícím:**
   - Pokročilé vyhledávání a filtrování vozidel
   - Prohlížení detailních informací o vozidlech
   - Ukládání oblíbených inzerátů
   - Přímou komunikaci se prodávajícím
   - Zanechávání recenzí a hodnocení prodávajících

3. **Implementovat administraci:**
   - Správu uživatelských účtů a rolí
   - Moderování inzerátů
   - Statistiky platformy
   - Správu systému jako celku

4. **Zajistit bezpečnost:**
   - Bezpečnou autentifikaci a autorizaci
   - Šifrování citlivých dat
   - Ochrana před běžnými webovými útoky
   - Role-based access control (RBAC)

5. **Zajistit dostupnost:**
   - Responsive design vhodný pro mobily, tablety a desktopy
   - Rychlé načítání a optimalizace výkonu
   - Search engine optimization (SEO)

Vedlejším cílem je vytvořit kvalitní technickou dokumentaci, která by byla k dispozici vývojářům při budoucích rozšířeních nebo údržbě aplikace.

## 1.3 Rešerše a konkurenční analýza

České autobazary (Sauto.cz, Bazos.cz) pracují se zastaralou technologií, nepřehledným UI a vysokými náklady na inzerci. AutoNova se liší moderním designem, bezpečnou autentifikací a bez poplatků. Aplikace implementuje aktuální trendy: TypeScript, SSR pro SEO, API-first architekturu a role-based access control.

---

# 2. TEORETICKÁ ČÁST

## 2.1 Technologický stack a zdůvodnění

**Frontend: Next.js 15** - Umožňuje server-side rendering pro SEO, optimalizaci obrázků a modern developer experience s TypeScript supportem.

**Backend: NestJS** - Poskytuje modulární strukturu, dependency injection a dobré architekturní vzory (SOLID principy).

**Databáze: JSON** - Pro lokální demonstraci bez externích závislostí. Pro produkci by byla migrace na PostgreSQL.

**Autentifikace: JWT** - Bezstavový přístup vhodný pro API-first architektur a mobilní aplikace.

**Bezpečnost:** Bcrypt hashem hesel, Input validace, CORS, Role-based access control (RBAC).

---

# 3. METODIKA A ŘEŠENÍ

## 3.1 Vrstvená architektura

Aplikace implementuje vrstvený architekturní vzor se čtyřmi hlavními vrstvami:

1. **Presentation Layer** - Next.js komponenty a stránky (UI)
2. **API Layer** - NestJS Controllers (REST endpointy)
3. **Business Logic** - NestJS Services (obchodní pravidla)
4. **Data Access** - JsonDbService (přístup k databázi)

Takovéto oddělení vrstev umožňuje snadné rozšíření a údržbu kódu.

## 3.2 Datový model

Aplikace pracuje s těmito hlavními entitami:

- **User** - Uživatelské účty s rolemi (USER, DEALER, ADMIN)
- **Ad** - Inzeráty vozidel s informacemi (cena, rok, tržítko)
- **Image** - Fotografie přiřazené k inzerátům
- **SavedAd** - Uložená vozidla (oblíbené)
- **Review** - Recenze a hodnocení
- **ContactSubmission** - Zprávy z formuláře

Databáze je uložena v souboru `db.json` s následující strukturou:

```json
{
  "users": [...],
  "ads": [...],
  "images": [...],
  "savedAds": [...],
  "reviews": [...],
  "contactSubmissions": [...]
}
```

## 3.3 Moduly v NestJS

Aplikace je rozdělena do modulů:

- **AuthModule** - Přihlášení, registrace, JWT
- **AdModule** - CRUD pro inzeráty, file upload
- **UserModule** - Profil a správa uživatelů
- **AdminModule** - Admin operace
- **SavedAdModule** - Uložené vozidla
- **ContactModule** - Kontaktní formulář

---

# 4. VÝSLEDKY

Aplikace implementuje kompletní funkcionalitu pro e-commerce autobazaru:

**Pro kupující:** Procházení inzerátů, filtrování (značka, cena, rok, palivo), uložení oblíbených vozidel, prohlížení detailů, kontakt na prodávajícího.

**Pro prodávající:** Vytvoření inzerátu s až 15 fotografiemi, úprava a smazání inzerátu, sledování statistik (počet zobrazení).

**Pro administrátory:** Správa uživatelů (změna rolí), moderování inzerátů, přehled platformy.

## Nasazení a spouštění

**Windows:** Double-click `start-local.bat`  
**Mac/Linux:** `chmod +x start-local.sh && ./start-local.sh`

Backend běží na `http://localhost:3000`, Frontend na `http://localhost:3001`

**Demo účty:**
- Admin: admin@carta.cz / demo123
- Dealer: dealer@carta.cz / demo123
- Uživatel: user@carta.cz / demo123

---

# 5. DISKUSE

## Zdůvodnění řešení

**Next.js 15** byl zvolen pro frontend především kvůli server-side renderingu (SSR), který je kritický pro SEO autobazaru. Zároveň poskytuje optimalizaci obrázků a výborný developer experience.

**NestJS** v backendu zajišťuje strukturovanou, modulární architekkturu s dependency injection, což je ideální pro větší projekty a učení dobrých praktik.

**JSON databáze** byla vybrána pro lokální demonstraci bez externích závislostí. Pro produkční nasazení by byla nutná migrace na PostgreSQL, což by bylo vzhledem k Prisma API minimální.

**JWT autentifikace** s role-based access control (RBAC) poskytuje bezpečný a škálovatelný systém oprávnění.

## Srovnání s alternativami

| Aspekt | MERN Stack | AutoNova |
|--------|-----------|----------|
| Typing | TypeScript optional | TypeScript full-stack |
| Architektura | Volná | Strukturovaná (SOLID) |
| Bezpečnost | Základní | Pokročilá (RBAC, JWT, bcrypt) |
| SEO | Základní | Optimalizovaná (SSR) |
| Vhodnost pro learning | Jednodušší | Lepší praktiky |

**Tabulka 2: Porovnání přístupů**

## Limity a budoucí rozvoj

**Limity:**
- JSON DB nevhodná pro produkci
- Chybí real-time komunikace (WebSockets)
- Emails jen logované v konzoli
- Žádný payment gateway

**Budoucí rozšíření:**
- Migrace na PostgreSQL
- Real-time chat s Socket.io
- Email notifikace (Sendgrid)
- Platební systém (Stripe)
- Mobilní aplikace (React Native)
- Machine learning pro doporučení aut

---

# 6. ZÁVĚR

Maturitní práce se zabývala návrhem a implementací **moderní webové aplikace AutoNova** pro správu autobazaru. Projekt demonstruje klíčové koncepty fullstack vývoje:

- **Frontend:** Next.js 15 se Server Components pro SEO a optimalizaci
- **Backend:** NestJS s modulární architekturou a SOLID principy
- **Databáze:** JSON API pro lokální demo (migraci na PostgreSQL)
- **Bezpečnost:** JWT autentifikace, RBAC, bcrypt hesla, input validace
- **Funkcionalita:** CRUD pro inzeráty, uživatelské profily, admin panel, filtrování

Aplikace je plně funkční, bezpečná, rozšiřitelná a připravená na produkční nasazení s menšími úpravami (DB, emails, payments).

**Dosažené cíle:**
- ✅ Moderní architektura s best practices
- ✅ Plná funkcionalita (4 role, CRUD operace, filtrování)
- ✅ Bezpečnost (autentifikace, autorizace, validace)
- ✅ Responsive design
- ✅ Kompletní dokumentace

Projekt slouží jako výukový materiál pro správný přístup k webovému vývoji v roce 2026.

---

# 7. LITERATURA A ZDROJE

1. NestJS Documentation. Dostupné z: https://docs.nestjs.com/
2. Next.js Documentation. Dostupné z: https://nextjs.org/docs
3. JWT Introduction. Dostupné z: https://jwt.io/introduction
4. FOWLER, M. Enterprise Application Architecture Patterns. Addison-Wesley, 2002.
5. MARTIN, R. C. Clean Code: A Handbook of Agile Software Craftsmanship. Prentice Hall, 2008.
6. OWASP. Web Security Testing Guide. Dostupné z: https://owasp.org/
7. Mozilla Documentation Network (MDN). Dostupné z: https://developer.mozilla.org/
8. REST API Best Practices. Dostupné z: https://restfulapi.net/
9. TypeScript Handbook. Dostupné z: https://www.typescriptlang.org/
10. Docker Documentation. Dostupné z: https://docs.docker.com/

---

# 8. SEZNAM OBRÁZKŮ, TABULEK A DIAGRAMŮ

## Tabulky

- Tabulka 1: Srovnění AutoNovy s konkurenty
- Tabulka 2: Porovnání přístupů (MERN vs AutoNova)

## Diagramy

- Diagram 1: Obecná architektura komunikace
- Diagram 2: Vrstvený architekturní vzor

---

# 9. PŘÍLOHY

## Příloha A: Úplná API Dokumentace

Aplikace poskytuje REST API pro komunikaci mezi frontendem a backendem. Všechny endpointy vrací JSON odpovědi.

### Autentifikace

**POST /auth/register** - Registrace nového uživatele

```
Request:
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "nova@example.com",
  "password": "heslo123",
  "name": "Nový uživatel",
  "isDealer": false
}

Response (201):
{
  "id": "uuid-1234",
  "email": "nova@example.com",
  "name": "Nový uživatel",
  "role": "USER",
  "createdAt": "2026-03-16T10:30:00Z"
}

Response (400):
{
  "message": "Uživatel s tímto emailem již existuje",
  "statusCode": 400
}
```

**POST /auth/login** - Přihlášení

```
Request:
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@carta.cz",
  "password": "demo123"
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-admin",
    "email": "admin@carta.cz",
    "name": "Admin",
    "role": "ADMIN"
  }
}

Response (401):
{
  "message": "Nesprávný email nebo heslo",
  "statusCode": 401
}
```

**GET /auth/me** - Profil aktuálního uživatele

```
Request:
GET http://localhost:3000/auth/me
Authorization: Bearer <token>

Response (200):
{
  "id": "uuid-user",
  "email": "user@carta.cz",
  "name": "Jan Novák",
  "role": "USER",
  "createdAt": "2026-01-15T10:30:00Z"
}

Response (401):
{
  "message": "Chybí autorizační token",
  "statusCode": 401
}
```

### Inzeráty

**GET /ad** - Seznam inzerátů s filtrováním

```
Request:
GET http://localhost:3000/ad?brand=Škoda&priceFrom=300000&priceTo=400000&page=1&limit=10

Response (200):
{
  "ads": [
    {
      "id": "uuid-ad-1",
      "title": "Škoda Octavia 2020",
      "brand": "Škoda",
      "model": "Octavia",
      "year": 2020,
      "price": 350000,
      "mileage": 75000,
      "fuel": "diesel",
      "transmission": "manual",
      "images": [
        { "url": "/uploads/img1.jpg", "order": 1 },
        { "url": "/uploads/img2.jpg", "order": 2 }
      ],
      "views": 42,
      "createdAt": "2026-02-10T15:30:00Z"
    }
  ],
  "totalCount": 156,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 16
  }
}
```

**POST /ad** - Vytvoření inzerátu

```
Request:
POST http://localhost:3000/ad
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- title: "Škoda Octavia 2020"
- brand: "Škoda"
- model: "Octavia"
- year: 2020
- price: 350000
- mileage: 75000
- bodyType: "sedan"
- fuel: "diesel"
- transmission: "manual"
- power: 120
- engineVolume: 2000
- color: "modrá"
- description: "Popis vozidla..."
- contactPhone: "777123456"
- images: [File1, File2, ...] (minimálně 2)

Response (201):
{
  "id": "uuid-ad-new",
  "title": "Škoda Octavia 2020",
  "brand": "Škoda",
  "createdAt": "2026-03-16T10:30:00Z",
  "images": [...]
}

Response (400):
{
  "message": "Musíte přidat alespoň 2 obrázky"
}

Response (401):
{
  "message": "Jen dealers mohou vytvářet inzeráty"
}
```

**GET /ad/:id** - Detail inzerátu

```
Request:
GET http://localhost:3000/ad/uuid-ad-1

Response (200):
{
  "id": "uuid-ad-1",
  "title": "Škoda Octavia 2020",
  "brand": "Škoda",
  "model": "Octavia",
  "year": 2020,
  "price": 350000,
  "mileage": 75000,
  "description": "Perfektní stav, servisní knížka, kůže, panorama",
  "bodyType": "sedan",
  "fuel": "diesel",
  "transmission": "manual",
  "power": 120,
  "engineVolume": 2000,
  "color": "modrá",
  "images": [
    { "url": "/uploads/img1.jpg", "order": 1 },
    { "url": "/uploads/img2.jpg", "order": 2 },
    { "url": "/uploads/img3.jpg", "order": 3 }
  ],
  "contactPhone": "777123456",
  "contactEmail": "dealer@example.com",
  "contactName": "Prodejce",
  "user": {
    "id": "uuid-dealer",
    "name": "Autobazar XYZ",
    "email": "dealer@example.com"
  },
  "views": 42,
  "createdAt": "2026-02-10T15:30:00Z"
}

Response (404):
{
  "message": "Inzerát nebyl nalezen"
}
```

**PATCH /ad/:id** - Úprava inzerátu (vlastník)

```
Request:
PATCH http://localhost:3000/ad/uuid-ad-1
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 340000,
  "mileage": 76000
}

Response (200):
{
  "id": "uuid-ad-1",
  "price": 340000,
  "mileage": 76000,
  "updatedAt": "2026-03-16T10:30:00Z"
}

Response (403):
{
  "message": "Nemáte právo upravovat tento inzerát"
}
```

**DELETE /ad/:id** - Smazání inzerátu (vlastník)

```
Request:
DELETE http://localhost:3000/ad/uuid-ad-1
Authorization: Bearer <token>

Response (200):
{
  "message": "Inzerát byl smazán"
}

Response (403):
{
  "message": "Nemáte právo smazat tento inzerát"
}
```

### Uložená vozidla

**GET /saved-ad** - Oblíbená vozidla uživatele

```
Request:
GET http://localhost:3000/saved-ad
Authorization: Bearer <token>

Response (200):
{
  "savedAds": [
    {
      "id": "uuid-saved-1",
      "ad": {
        "id": "uuid-ad-1",
        "title": "Škoda Octavia 2020",
        "price": 350000,
        "images": [...]
      },
      "createdAt": "2026-03-15T10:30:00Z"
    }
  ]
}
```

**POST /saved-ad/:adId** - Uložení vozidla do oblíbených

```
Request:
POST http://localhost:3000/saved-ad/uuid-ad-1
Authorization: Bearer <token>

Response (201):
{
  "id": "uuid-saved-new",
  "adId": "uuid-ad-1",
  "createdAt": "2026-03-16T10:30:00Z"
}

Response (409):
{
  "message": "Toto vozidlo je již uloženo"
}
```

**DELETE /saved-ad/:adId** - Odebrání z oblíbených

```
Request:
DELETE http://localhost:3000/saved-ad/uuid-ad-1
Authorization: Bearer <token>

Response (200):
{
  "message": "Vozidlo bylo odebráno z oblíbených"
}
```

### Administrace

**GET /admin/users** - Seznam všech uživatelů (Admin only)

```
Request:
GET http://localhost:3000/admin/users
Authorization: Bearer <admin-token>

Response (200):
{
  "users": [
    {
      "id": "uuid-user-1",
      "email": "user@example.com",
      "name": "Jan Novák",
      "role": "USER",
      "isDealer": false,
      "createdAt": "2026-01-15T10:30:00Z"
    },
    {
      "id": "uuid-dealer-1",
      "email": "dealer@example.com",
      "name": "Autobazar XYZ",
      "role": "DEALER",
      "isDealer": true,
      "createdAt": "2026-01-10T08:00:00Z"
    }
  ]
}

Response (403):
{
  "message": "Přístup odepřen. Pouze admini"
}
```

**PATCH /admin/users/:id/role** - Změna role uživatele (Admin only)

```
Request:
PATCH http://localhost:3000/admin/users/uuid-user-1/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "DEALER"
}

Response (200):
{
  "id": "uuid-user-1",
  "email": "user@example.com",
  "role": "DEALER",
  "updatedAt": "2026-03-16T10:30:00Z"
}

Response (403):
{
  "message": "Přístup odepřen"
}
```

**GET /admin/ads** - Seznam všech inzerátů (Admin only)

```
Request:
GET http://localhost:3000/admin/ads
Authorization: Bearer <admin-token>

Response (200):
{
  "ads": [
    {
      "id": "uuid-ad-1",
      "title": "Škoda Octavia 2020",
      "user": { "name": "Dealer 1" },
      "isVisible": true,
      "views": 42,
      "createdAt": "2026-02-10T15:30:00Z"
    },
    {
      "id": "uuid-ad-2",
      "title": "VW Golf 2019",
      "user": { "name": "Dealer 2" },
      "isVisible": false,  // Skrytý inzerát
      "views": 0,
      "createdAt": "2026-03-01T12:00:00Z"
    }
  ]
}
```

### Chybové kódy

| Kód | Popis |
|-----|-------|
| 200 | OK - Úspěšná operace |
| 201 | Created - Zdroj vytvořen |
| 400 | Bad Request - Chybná data |
| 401 | Unauthorized - Chybí/neplatný token |
| 403 | Forbidden - Přístup odepřen |
| 404 | Not Found - Zdroj neexistuje |
| 409 | Conflict - Datový konflikt |
| 500 | Server Error - Interní chyba |

## Příloha B: Uživatelská příručka

### Instalace

1. Node.js 18+ a npm
2. `git clone <repo>` a `cd AutoNova`
3. Windows: `start-local.bat` | Mac/Linux: `chmod +x start-local.sh && ./start-local.sh`
4. Otevřete http://localhost:3001

### Základní funkce

- **Registrace:** Klikněte "Registrovat se", vyplňte údaje
- **Přihlášení:** "Přihlásit se", zadejte email a heslo
- **Hledání:** Procházejte auta, filtrujte podle ceny, značky, roku
- **Uložení:** Klikněte na srdíčko pro oblíbené
- **Prodej (Dealer):** "Prodej auto", nahrajte minimálně 2 fotografie

### Demo data

| Email | Heslo | Role |
|-------|-------|------|
| admin@carta.cz | demo123 | Admin |
| dealer@carta.cz | demo123 | Dealer |
| user@carta.cz | demo123 | Uživatel |

## Příloha C: Technické nastavení

### Požadavky

- Node.js 18+
- RAM: 2 GB
- Disk: 500 MB
- OS: Windows 10+, macOS 10.14+, Linux

### Struktura projektu

```
AutoNova/
├── backend/          # NestJS API (port 3000)
│   ├── src/
│   │   ├── ad/      # Správa inzerátů
│   │   ├── auth/    # Autentifikace
│   │   ├── user/    # Uživatelé
│   │   ├── admin/   # Admin panelimport
│   │   └── database/ # JSON DB
│   └── uploads/     # Obrázky
├── frontend/         # Next.js App (port 3001)
│   ├── app/
│   │   ├── ads/    # Stránka s inzeráty
│   │   ├── login/  # Přihlášení
│   │   └── admin/  # Admin panel
│   └── public/     # Statické soubory
└── db.json         # JSON databáze
```

---

**Konec dokumentace - Celkem cca 25-30 stran vlastního textu**

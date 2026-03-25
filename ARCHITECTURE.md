# 🏗️ Architecture Overview - Local Version

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                     http://localhost:3001                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                        │
│                     Port: 3001                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  • Server Components (Homepage, Listings, etc.)           │ │
│  │  • Client Components (Forms, Interactive UI)             │ │
│  │  • API Routes (Image proxying if needed)                 │ │
│  │  • Static Assets (CSS, JS, Images)                       │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ API Calls
                         │ (fetch/axios)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                             │
│                     Port: 3000                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   API ENDPOINTS                           │ │
│  │  • /auth/*      - Authentication                         │ │
│  │  • /user/*      - User management                        │ │
│  │  • /ad/*        - Car listings CRUD                      │ │
│  │  • /saved-ad/*  - Favorites                              │ │
│  │  • /admin/*     - Admin panel                            │ │
│  │  • /contact/*   - Contact forms                          │ │
│  │  • /uploads/*   - Static file serving                    │ │
│  └───────────────────┬───────────────────────────────────────┘ │
│                      │                                           │
│                      ▼                                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              SERVICE LAYER                                │ │
│  │  • UserService     • AdService                           │ │
│  │  • AuthService     • SavedAdService                      │ │
│  │  • EmailService    • AdminService                        │ │
│  └───────────────────┬───────────────────────────────────────┘ │
│                      │                                           │
│                      ▼                                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │           JSON DATABASE SERVICE                           │ │
│  │  JsonDbService (Prisma-compatible API)                   │ │
│  │  • create()   • findMany()   • update()                  │ │
│  │  • findOne()  • delete()     • deleteMany()              │ │
│  └───────────────────┬───────────────────────────────────────┘ │
└──────────────────────┼───────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL FILE SYSTEM                            │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  📄 backend/src/database/db.json                         │ │
│  │     {                                                     │ │
│  │       "users": [...],                                    │ │
│  │       "ads": [...],                                      │ │
│  │       "images": [...],                                   │ │
│  │       "reviews": [...],                                  │ │
│  │       "savedAds": [...],                                 │ │
│  │       ...                                                │ │
│  │     }                                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  📁 backend/uploads/                                     │ │
│  │     • uuid1.jpg                                          │ │
│  │     • uuid2.png                                          │ │
│  │     • uuid3.jpg                                          │ │
│  │     ...                                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. User Browses Cars

```
Browser → Frontend (/) → API GET /ad → AdService.findAll() 
→ JsonDbService.ad.findMany() → Read db.json → Return ads[]
→ AdService → API Response → Frontend → Render car cards
```

### 2. User Creates New Listing

```
Browser → Frontend (/ads/create) → Form Submit → API POST /ad/create
→ AdService.create() → JsonDbService.ad.create() 
→ Write to db.json → Return new ad
→ Upload images → Save to uploads/ → Update db.json with image URLs
→ API Response → Frontend → Redirect to ad detail
```

### 3. User Logs In

```
Browser → Frontend (/login) → Submit credentials 
→ API POST /auth/login → AuthService.login()
→ JsonDbService.user.findUnique() → Read db.json
→ Compare password → Generate JWT token
→ API Response with token → Frontend stores in localStorage
→ Subsequent requests include JWT in headers
```

### 4. Admin Views All Users

```
Browser → Frontend (/admin) → API GET /admin/users
→ AdminGuard checks JWT → AuthService.validateToken()
→ AdminController.getUsers() → JsonDbService.user.findMany()
→ Read db.json → Return users[] → API Response
→ Frontend → Render user table
```

## Component Interactions

### Authentication Flow
```
┌──────────┐    JWT Token    ┌──────────┐    Verify    ┌───────────┐
│ Frontend │ ───────────────> │  Backend │ ───────────> │ JsonDbSvc │
│          │                  │  Guard   │              │           │
└──────────┘                  └──────────┘              └───────────┘
     │                             │                          │
     │                             │ User exists?             │
     │                             │ <────────────────────────┘
     │                             │
     │      Allow/Deny             │
     │ <───────────────────────────┘
```

### File Upload Flow
```
┌──────────┐  FormData   ┌──────────┐   Save    ┌──────────┐
│ Frontend │ ──────────> │  Multer  │ ────────> │ uploads/ │
│  Form    │             │ Middle-  │           │  folder  │
└──────────┘             │  ware    │           └──────────┘
                         └──────────┘
                              │
                              │ Return file path
                              ▼
                         ┌──────────┐   Store URL   ┌─────────┐
                         │   Ad     │ ────────────> │ db.json │
                         │ Service  │               └─────────┘
                         └──────────┘
```

### Database Operations
```
                  JsonDbService
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    user.create   ad.findMany  image.delete
          │            │            │
          └────────────┼────────────┘
                       ▼
                  File System
                       │
              ┌────────┴────────┐
              ▼                 ▼
          Read db.json     Write db.json
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Styling**: SCSS Modules + Tailwind CSS
- **State**: React Context API
- **HTTP Client**: Fetch API
- **Forms**: React Hook Form

### Backend
- **Framework**: NestJS (Express)
- **Auth**: JWT (jsonwebtoken)
- **Validation**: class-validator
- **File Upload**: Multer
- **Password**: bcrypt

### Data Layer
- **Database**: JSON file storage
- **ORM**: Custom Prisma-compatible wrapper
- **File Storage**: Local file system
- **Caching**: None (direct file access)

## Deployment Architecture (Local)

```
┌─────────────────────────────────────┐
│          Developer Machine          │
│  ┌─────────────────────────────┐   │
│  │  Terminal 1: Backend        │   │
│  │  npm run start:dev          │   │
│  │  Port: 3000                 │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  Terminal 2: Frontend       │   │
│  │  npm run dev                │   │
│  │  Port: 3001                 │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  Browser                    │   │
│  │  http://localhost:3001      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Security Considerations

### ✅ Implemented
- JWT authentication
- Password hashing (bcrypt)
- Input validation
- CORS protection
- Role-based access control

### ⚠️ Local-Only Limitations
- No HTTPS (localhost)
- No rate limiting
- No DDoS protection
- No CDN
- Single machine only

## Performance Characteristics

### Strengths
- ✅ Zero network latency
- ✅ Instant startup
- ✅ No external dependencies
- ✅ Simple debugging

### Limitations
- ⚠️ No query optimization
- ⚠️ No indexing
- ⚠️ Single-threaded file I/O
- ⚠️ Limited concurrency

## Scalability Path

If you need to scale:

```
JSON Files → SQLite → PostgreSQL → Distributed DB
    ↓           ↓          ↓             ↓
  10 users   100 users  10k users   1M+ users
```

## Migration Back to Cloud

To restore cloud functionality:

1. **Database**: Restore Prisma + PostgreSQL
2. **Storage**: Restore Supabase/S3
3. **Email**: Restore SMTP service
4. **Deploy**: Push to Vercel/Railway
5. **Config**: Update environment variables

---

**This architecture is optimized for local showcase and development!**

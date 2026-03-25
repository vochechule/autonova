# Carta Autobazar - Local Setup

This is a fully local version of the Carta autobazar application, designed to run without any cloud dependencies for showcasing purposes.

## What's Changed

### ✅ Removed Cloud Dependencies
- ❌ PostgreSQL Database → ✅ JSON File Storage
- ❌ Supabase Storage → ✅ Local File System
- ❌ SMTP Email Service → ✅ Console Logging
- ❌ Railway/Vercel Deployment → ✅ Local Development

### ✅ New Features
- JSON-based database (`backend/src/database/db.json`)
- Local file uploads (`backend/uploads/`)
- Console-based email logging
- No external service dependencies

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

Backend will run on: **http://localhost:3000**

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: **http://localhost:3001**

### 3. Access the Application

Open your browser and navigate to: **http://localhost:3001**

## Default Accounts

### Admin Account
- Email: `admin@carta.cz`
- Password: `admin123`

### Regular User
- Email: `user@carta.cz`
- Password: `user123`

### Dealer Account
- Email: `dealer@carta.cz`
- Password: `dealer123`

*Note: You can also register new accounts through the UI*

## Features & Demo

### ✨ User Features
- Browse car listings
- Search and filter cars
- View detailed car information
- Save favorite cars
- Contact sellers
- User profiles and reviews

### 🏢 Dealer Features
- Create and manage car listings
- Upload multiple images per listing
- Edit existing listings
- View listing statistics

### 👑 Admin Features
- Manage all users
- Moderate car listings
- View contact submissions
- User role management

## Data Storage

### Database
All application data is stored in:
```
backend/src/database/db.json
```

The JSON database includes:
- Users
- Car Ads
- Images (metadata)
- Reviews
- Saved Ads
- Contact Submissions

### Uploaded Images
Physical image files are stored in:
```
backend/uploads/
```

Images are served at: `http://localhost:3000/uploads/filename.jpg`

## Email Simulation

When users request password resets or contact forms are submitted, emails are logged to the backend console instead of being sent:

```
=== 📧 PASSWORD RESET EMAIL (Local Showcase) ===
To: user@example.com
Subject: 🔑 AutoNova - Obnovení hesla
Reset Link: http://localhost:3001/reset-password?token=abc123
==============================================
```

## Resetting Data

To start fresh with empty data:

1. Stop the backend server
2. Delete or clear `backend/src/database/db.json`
3. Optionally delete images from `backend/uploads/`
4. Restart the backend

The system will automatically recreate the database file.

## Project Structure

```
AutoNova/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── database/          # JSON Database
│   │   │   ├── db.json       # Data storage
│   │   │   ├── json-db.service.ts
│   │   │   └── database.module.ts
│   │   ├── ad/               # Car listings module
│   │   ├── user/             # User management
│   │   ├── auth/             # Authentication
│   │   ├── email/            # Email logging
│   │   └── ...
│   └── uploads/               # Image storage
├── frontend/                   # Next.js Frontend
│   ├── app/
│   │   ├── ads/              # Car listings pages
│   │   ├── profile/          # User profiles
│   │   ├── admin/            # Admin panel
│   │   └── components/       # React components
│   └── ...
└── LOCAL_SETUP.md             # This file
```

## Troubleshooting

### Backend won't start
- Make sure port 3000 is not in use
- Check that `backend/src/database/db.json` exists
- Run `npm install` in the backend directory

### Frontend won't start
- Make sure port 3001 is not in use
- Check that `NEXT_PUBLIC_API_URL` in `.env.local` points to `http://localhost:3000`
- Run `npm install` in the frontend directory

### Images not loading
- Verify images exist in `backend/uploads/`
- Check that backend is serving static files at `/uploads/`
- Ensure image URLs in database point to `/uploads/filename`

### Cannot login
- Check that `db.json` has user accounts
- Verify JWT_SECRET is set in backend `.env`
- Try registering a new account

## Production Build (Optional)

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
npm run start
```

## Environment Variables

### Backend (.env)
```env
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3001
PORT=3000
EMAIL_FROM="Carta.cz <noreply@carta.cz>"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Support

For issues or questions about the local setup, refer to the code comments or create an issue in the repository.

## License

This is a showcase/portfolio project.

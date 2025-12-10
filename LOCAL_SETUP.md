# Local Conversion Guide - Carta Autobazar

## Overview
This document outlines the conversion from cloud-based (Vercel + Railway + Supabase + PostgreSQL) to a fully local application using JSON file storage.

## Changes Made

### 1. Database Layer
- **Removed**: PostgreSQL + Prisma
- **Added**: JSON file-based database (`backend/src/database/db.json`)
- **New Service**: `JsonDbService` - provides Prisma-like API for JSON operations

### 2. File Storage
- **Removed**: Supabase Storage
- **Added**: Local file system storage in `backend/uploads/`
- Images are stored locally and served via Express static middleware

### 3. Email Service
- **Removed**: SMTP email sending
- **Changed**: Email operations now log to console (for showcase purposes)

### 4. Environment Variables
Updated `.env` files to remove cloud service dependencies:
- No DATABASE_URL needed
- No SUPABASE credentials
- No SMTP credentials (emails logged to console)

## Running Locally

### Backend Setup
```bash
cd backend
npm install
npm run start:dev
```

Server runs on: `http://localhost:3000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3001`

## Data Persistence
All data is stored in `backend/src/database/db.json`:
- Users
- Ads
- Images (metadata - actual images in `backend/uploads/`)
- Reviews
- Saved Ads
- Contact Submissions

## Features Working Locally
✅ User registration/login
✅ Create/edit/delete ads
✅ Upload images (stored locally)
✅ Search and filter ads
✅ Save favorite ads
✅ User profiles
✅ Reviews
✅ Contact forms
✅ Admin panel

## Showcase Mode
- Email sending logs to console instead of actual SMTP
- All data resets when you delete `db.json`
- Images stored in `backend/uploads/`

## Future Improvements
- Add data seed script for demo data
- Add export/import functionality for demo scenarios
- Consider using SQLite for better query performance if needed

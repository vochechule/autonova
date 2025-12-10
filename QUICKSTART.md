# 🚀 Quick Start Guide - Carta Autobazar (Local Version)

## ⚡ Fastest Way to Run

### Windows
Double-click `start-local.bat`

### Mac/Linux
```bash
chmod +x start-local.sh
./start-local.sh
```

That's it! The app will start automatically on:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:3001

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@carta.cz | demo123 |
| Dealer | dealer@carta.cz | demo123 |
| User | user@carta.cz | demo123 |

## 📁 What's Inside

- **3 Demo Users** (Admin, Dealer, Regular User)
- **3 Sample Car Listings** (Ready to browse)
- **Full CRUD Operations** (Create, Read, Update, Delete)
- **Image Upload** (Stored locally)
- **Search & Filter** (All working)
- **Reviews & Ratings** (Demo data included)

## ✨ Features You Can Showcase

### As Admin (admin@carta.cz)
- ✅ View all users and ads
- ✅ Manage user roles
- ✅ Moderate listings
- ✅ View contact submissions
- ✅ Full admin panel access

### As Dealer (dealer@carta.cz)
- ✅ Create unlimited car listings
- ✅ Upload multiple images per car
- ✅ Edit and manage own listings
- ✅ View listing statistics
- ✅ Respond to inquiries

### As User (user@carta.cz)
- ✅ Browse all car listings
- ✅ Search and filter cars
- ✅ Save favorite cars
- ✅ Contact sellers
- ✅ Leave reviews
- ✅ Manage profile

## 🛠️ Troubleshooting

### "Port already in use"
Close any apps using ports 3000 or 3001:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### "Module not found"
Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### "Cannot read db.json"
The file will be created automatically on first run. If issues persist:
```bash
cd backend/src/database
echo {} > db.json
```

## 📊 Project Structure

```
AutoNova/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── database/    # JSON DB
│   │   ├── uploads/     # Images
│   │   └── ...
├── frontend/            # Next.js UI
│   ├── app/
│   │   ├── ads/        # Car listings
│   │   ├── admin/      # Admin panel
│   │   └── ...
├── start-local.bat      # Windows launcher
└── start-local.sh       # Unix launcher
```

## 🎯 Demo Scenarios

### Scenario 1: Browse Cars
1. Visit http://localhost:3001
2. View featured cars on homepage
3. Use filters to search (price, brand, fuel type)
4. Click on a car to see details

### Scenario 2: Create Listing (as Dealer)
1. Login as dealer@carta.cz
2. Click "Přidat inzerát" (Add Listing)
3. Fill in car details
4. Upload images
5. Publish listing

### Scenario 3: Admin Management
1. Login as admin@carta.cz
2. Go to Admin Panel
3. View all users and ads
4. Manage user roles
5. View contact submissions

### Scenario 4: User Experience
1. Login as user@carta.cz
2. Browse cars
3. Save favorites
4. Contact a seller
5. Leave a review

## 🔄 Reset Demo Data

To start fresh:
```bash
# Stop the app (Ctrl+C)
cd backend/src/database
del db.json          # Windows
rm db.json           # Mac/Linux
# Restart the app - new demo data will be created
```

## 📝 Notes

- **Data Persistence**: All data stored in `backend/src/database/db.json`
- **Images**: Stored in `backend/uploads/` directory
- **Emails**: Logged to console (no actual emails sent)
- **Performance**: Optimized for showcase, not production

## 🌐 Access URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api (if enabled)
- **Uploads**: http://localhost:3000/uploads/

## 💡 Tips for Showcasing

1. **Start with Admin Login** - Shows full system capabilities
2. **Create a New Listing** - Demonstrates CRUD operations
3. **Show Search/Filter** - Highlights user experience
4. **Check Console Logs** - Shows email functionality (logged)
5. **Browse Admin Panel** - Demonstrates management features

## 🚀 Next Steps

After exploring the demo:
1. Read `README_LOCAL.md` for detailed documentation
2. Check `CONVERSION_SUMMARY.md` for technical details
3. Explore the codebase structure
4. Customize for your needs

## ❓ Need Help?

Check these files for more info:
- `README_LOCAL.md` - Full documentation
- `LOCAL_SETUP.md` - Setup details
- `CONVERSION_SUMMARY.md` - Technical changes

---

**Enjoy showcasing Carta Autobazar! 🚗✨**

# 🏥 MediCare AI — Your Health Assistant

## 🚀 Quick Start (ONE CLICK)

### Option 1: Double-click the script
1. Open the `d:\Medi` folder in File Explorer
2. **Double-click `START.bat`**
3. Done! The app opens in your browser automatically

### Option 2: Manual start
Open **two terminals** (Command Prompt or PowerShell):

**Terminal 1 — Backend:**
```bash
cd d:\Medi\backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd d:\Medi\frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## 🛑 How to Stop

- **Option 1:** Double-click `STOP.bat`
- **Option 2:** Close both terminal windows
- **Option 3:** Press `Ctrl+C` in each terminal

---

## ❓ Common Problems & Fixes

### "The app doesn't open / blank page"
→ Make sure you opened **http://localhost:3000** (NOT localhost:5000)
→ The frontend needs a few seconds to start. Wait for `VITE ready` message.

### "Cannot connect" or "Network Error"
→ The backend server is not running. Start it with:
```bash
cd d:\Medi\backend
npm run dev
```

### "Port already in use"
→ Another process is using port 3000 or 5000. Run `STOP.bat` first, then `START.bat`.

### "MongoDB Error"
→ MongoDB is optional. The server starts without it but some features may be limited.
→ To install MongoDB: https://www.mongodb.com/try/download/community

### "node is not recognized"
→ Install Node.js from https://nodejs.org (v18 or higher)

### "Module not found" errors
→ Run these commands:
```bash
cd d:\Medi\backend
npm install

cd d:\Medi\frontend
npm install
```

---

## 📁 Project Structure
```
d:\Medi\
├── START.bat          ← Double-click to start everything
├── STOP.bat           ← Double-click to stop everything
├── backend\           ← Node.js + Express API server
│   ├── server.js
│   ├── controllers\
│   ├── routes\
│   ├── models\
│   └── .env
└── frontend\          ← React + Vite UI
    ├── src\
    │   ├── pages\     ← All page components
    │   ├── components\
    │   └── services\
    └── vite.config.js
```

## 🔗 URLs When Running
| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

## 📋 Requirements
- **Node.js** v18+ (https://nodejs.org)
- **MongoDB** (optional, for full functionality — https://www.mongodb.com/try/download/community)

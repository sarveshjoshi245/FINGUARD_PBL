# 🚀 FINGUARD Platform - Quick Start Guide

## **Overview**

FINGUARD is an AI-driven digital banking onboarding platform with:
- ✅ Customer onboarding portal
- ✅ Admin dashboard for fraud detection & KYC verification
- ✅ Groq AI integration for intelligent assistance
- ✅ MongoDB Atlas cloud database
- ✅ JWT authentication for admins
- ✅ Complete audit trail for compliance

---

## **🎯 Quick Start (Recommended)**

### **Option 1: Simple Run (One Command)**

```powershell
# Navigate to project directory
cd C:\Users\dhruv\Desktop\De-coDe-main\De-coDe-main

# Run the complete setup
.\run.ps1
```

This will:
- ✅ Check Node.js installation
- ✅ Install all dependencies
- ✅ Start the backend server
- ✅ Display all URLs and credentials

**Then open in browser:**
- 📱 Customer Portal: http://localhost:3000
- 👮 Admin Dashboard: http://localhost:3000/#adminPortal

---

### **Option 2: Manual Steps**

```powershell
# 1. Navigate to backend
cd backend

# 2. Install dependencies (first time only)
npm install

# 3. Start backend server
npm start

# 4. Backend runs at http://localhost:3000
```

---

## **🔐 Admin Login Credentials**

**Default Test Admin:**
```
Username: admin
Password: Admin@123
```

**Or create a new admin:**
```powershell
# Use curl or Postman
POST http://localhost:3000/api/auth/register-admin
Content-Type: application/json

{
  "username": "newadmin",
  "email": "admin@example.com",
  "password": "StrongPass@123"
}
```

---

## **📡 Available URLs**

| Feature | URL | Purpose |
|---------|-----|---------|
| **Customer Portal** | http://localhost:3000 | Account opening, onboarding |
| **Admin Dashboard** | http://localhost:3000/#adminPortal | View applications, approve/reject |
| **API Docs** | http://localhost:3000/api/health | Check API health |

---

## **🗂️ Project Structure**

```
FINGUARD/
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── app.js             # Main entry point
│   │   ├── controllers/       # Request handlers (auth, applications, drafts, audit, chat)
│   │   ├── routes/            # API routes (authRoutes, applicationRoutes, etc.)
│   │   ├── services/          # Business logic (applicationService, draftService, etc.)
│   │   ├── repositories/      # Data layer (JSON & MongoDB)
│   │   ├── models/            # MongoDB Mongoose schemas
│   │   ├── middleware/        # JWT auth, validation
│   │   ├── config/            # Configuration (app, db, ai)
│   │   └── database/          # Connection utilities
│   ├── package.json
│   ├── .env                   # Configuration (API keys, MongoDB URI)
│   └── test-*.js              # Test files
│
├── frontend/src/              # Frontend (HTML/CSS/JS)
│   ├── onboarding.html        # Customer onboarding UI (SINGLE SOURCE)
│   ├── onboarding.script.js   # Onboarding logic
│   ├── onboarding.style.css   # Onboarding styles
│   ├── script.js              # Admin dashboard logic
│   ├── style.css              # Admin dashboard styles
│   ├── agent/                 # AI agent widgets
│   └── logo.png
│
└── run.ps1                    # Quick start script
```

---

## **🔧 API Endpoints (20 Total)**

### **Authentication (3)**
```
POST   /api/auth/register-admin    Create admin account
POST   /api/auth/login             Authenticate admin (returns JWT token)
GET    /api/auth/me                Get current admin (requires auth)
```

### **Applications (6)**
```
POST   /api/applications           Submit new application
GET    /api/applications           List all applications
GET    /api/applications/:id       Get single application
GET    /api/applications/stats/summary  Get statistics
PUT    /api/applications/:id/approve    Approve application
PUT    /api/applications/:id/reject     Reject application
```

### **Drafts (5)**
```
POST   /api/drafts                 Save draft (autosave every 20s)
GET    /api/drafts                 List all drafts
GET    /api/drafts/:mobile         Get draft by mobile (resume)
DELETE /api/drafts/:mobile         Delete specific draft
DELETE /api/drafts                 Clear all drafts
```

### **Audit Logs (4)**
```
GET    /api/audit-logs             List audit logs
GET    /api/audit-logs/summary     Audit summary statistics
GET    /api/audit-logs/entity/:id  Logs for specific entity
GET    /api/audit-logs/action/:act Logs by action type
```

### **Chat/AI (2)**
```
POST   /api/chat                   Admin chat with Groq AI
POST   /api/onboarding             Onboarding chat assistant
```

### **Health Check**
```
GET    /api/health                 API status check
```

---

## **📋 Example Workflows**

### **Customer - Start Onboarding**

1. Open http://localhost:3000
2. Click "Open Account"
3. Enter details step-by-step
4. Face verification, document OCR, signature capture
5. Submit application
6. Can resume later by entering mobile number

### **Admin - Review Applications**

1. Open http://localhost:3000/#adminPortal
2. Login with credentials (admin/Admin@123)
3. Navigate to "Identity & Security" section
4. See pending applications in "Verification Queue"
5. View forensics (documents, face capture)
6. Approve or reject with reason
7. All actions logged in "Compliance" section

### **Programmatic - Test API**

```powershell
# 1. Create admin
$admin = @{
    username = "testadmin"
    email = "test@example.com"
    password = "Test@123"
} | ConvertTo-Json | Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register-admin" -Method POST -ContentType "application/json"

# 2. Login
$login = @{
    username = "testadmin"
    password = "Test@123"
} | ConvertTo-Json | Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json"

$token = ($login.Content | ConvertFrom-Json).token

# 3. Submit application
$app = @{
    name = "John Doe"
    email = "john@example.com"
    mobile = "9876543210"
    # ... other fields
} | ConvertTo-Json | Invoke-WebRequest -Uri "http://localhost:3000/api/applications" -Method POST -ContentType "application/json"

# 4. List applications (requires token)
Invoke-WebRequest -Uri "http://localhost:3000/api/applications" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

---

## **🗄️ Database**

### **Current: MongoDB Atlas** ✅
- Cloud database (no local setup needed)
- Auto-scaling, backups included
- Connection: `mongodb+srv://dhruvkatheria2006_db_user:***@cluster0.u3ladlp.mongodb.net/finguard_db`

### **Fallback: JSON Persistence**
- If MongoDB unavailable, automatically uses JSON file
- Data stored in OS temp folder
- Perfect for development/testing

### **Collections**
- `applications` - Customer onboarding applications
- `admins` - Admin user accounts
- `auditLogs` - All system actions
- `drafts` - Incomplete applications (TTL: 30 days)

---

## **🔒 Security Features**

- ✅ JWT tokens for admin authentication
- ✅ Bcrypt password hashing
- ✅ CORS protection
- ✅ Request validation with Zod
- ✅ Audit trail for compliance
- ✅ Environment variable protection
- ✅ Face liveness detection (client-side)
- ✅ Document OCR verification

---

## **🛠️ Troubleshooting**

### **Port 3000 already in use**
```powershell
# Kill the process using port 3000
Get-Process | Where-Object {$_.Handle.Count -gt 500} | Stop-Process -Force
```

### **MongoDB connection fails**
- Check internet connection
- Verify credentials in `.env`
- MongoDB Atlas might need IP whitelist update

### **Dependencies missing**
```powershell
cd backend
npm install --save
```

### **Port 3000 in use**
```powershell
npx kill-port 3000
```

---

## **📊 Testing Credentials**

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123 |
| Test Customer | Any Mobile | Any Details |

---

## **💡 Next Steps**

1. ✅ **Backend running** - Check API health at http://localhost:3000/api/health
2. ✅ **Admin dashboard** - Try http://localhost:3000/#adminPortal with test credentials
3. ✅ **Customer onboarding** - Open http://localhost:3000 and start application
4. ✅ **API testing** - Use the provided curl commands to test endpoints
5. ✅ **MongoDB** - Monitor data at MongoDB Atlas dashboard

---

## **📞 Support**

For issues or questions:
1. Check `.env` file has correct configuration
2. Verify all dependencies installed: `npm list`
3. Check backend logs for detailed errors
4. Test API endpoints with curl/Postman

---

**Happy Banking with FINGUARD! 🏦**

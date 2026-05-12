# 🏃 FINGUARD - Run Guide (Copy-Paste Ready)

## **⚡ Fastest Way to Run (1 Command)**

```powershell
# Open PowerShell and run this ONE command:
cd C:\Users\dhruv\Desktop\De-coDe-main\De-coDe-main; .\run.ps1
```

**Then open in your browser:**
- 📱 **Customer Portal**: http://localhost:3000
- 👮 **Admin Dashboard**: http://localhost:3000/#adminPortal
  - Username: `admin`
  - Password: `Admin@123`

---

## **Manual Way (If script doesn't work)**

```powershell
# Step 1: Open PowerShell
# Step 2: Navigate to project
cd C:\Users\dhruv\Desktop\De-coDe-main\De-coDe-main\backend

# Step 3: Start backend
npm start

# Wait for: "🏦 FINGUARD Platform running at http://localhost:3000"
```

**Browser links appear automatically** ✅

---

## **What You'll See**

### Starting Backend
```
✅ Groq client initialized
🔄 Attempting MongoDB connection...
✅ MongoDB connected successfully
✅ Services initialized successfully

🏦 FINGUARD Platform running at http://localhost:3000
📋 Agent: Not configured
🤖 Model: mixtral-8x7b-32768 (Groq)
🔑 Groq API Key: ✅ Configured
```

### Now Available
| URL | Opens |
|-----|-------|
| http://localhost:3000 | 📱 Customer Account Opening |
| http://localhost:3000/#adminPortal | 👮 Admin Dashboard (requires login) |
| http://localhost:3000/api/health | ✅ API Health Check |

---

## **🔓 Admin Dashboard Login**

**Pre-created Test Account:**
- Username: `admin`
- Password: `Admin@123`

**Or create your own:**

Using Postman/curl:
```bash
POST http://localhost:3000/api/auth/register-admin

{
  "username": "myusername",
  "email": "myemail@example.com",
  "password": "MyPassword@123"
}
```

---

## **🎯 Quick Testing Guide**

### **1. Customer - Start Onboarding**
1. Go to http://localhost:3000
2. Click "Start Digital Account Opening"
3. Fill in form (test data works):
   - Name: John Doe
   - Email: john@example.com
   - Mobile: 9876543210
   - Aadhaar: 123456789012
   - PAN: ABCDE1234F
4. Click "Submit"
5. Application saved! ✅

### **2. Customer - Resume Later**
1. Go to http://localhost:3000
2. Under "Resume Existing Application"
3. Enter same mobile: `9876543210`
4. Click "Check Status"
5. Continues from step you left off ✅

### **3. Admin - Review Applications**
1. Go to http://localhost:3000/#adminPortal
2. Login: `admin` / `Admin@123`
3. Click "Identity & Security" section
4. See applications in "Verification Queue"
5. Click "Review" button
6. Approve or Reject ✅

### **4. Test API**
```powershell
# Check health
Invoke-WebRequest http://localhost:3000/api/health

# List applications
Invoke-WebRequest http://localhost:3000/api/applications

# Get stats
Invoke-WebRequest http://localhost:3000/api/applications/stats/summary
```

---

## **🛑 Troubleshooting**

### **"Port 3000 already in use"**
```powershell
Get-Process node | Stop-Process -Force
.\run.ps1
```

### **"npm: command not found"**
- Install Node.js from https://nodejs.org/
- Restart PowerShell
- Try again

### **"Cannot find module"**
```powershell
cd backend
npm install
npm start
```

### **MongoDB connection timeout**
- Check internet connection
- Check .env file has correct MONGODB_URI
- Backend will fallback to JSON (data still saved) ✅

---

## **📁 File Structure (Single Onboarding)**

```
Project/
├── backend/
│   ├── src/app.js              ← Main server
│   ├── package.json
│   └── .env                    ← Your API keys
│
├── frontend/src/               ← ONLY ONBOARDING FILE HERE
│   ├── onboarding.html         ← ALL-IN-ONE (Customer + Admin)
│   ├── onboarding.script.js
│   ├── onboarding.style.css
│   └── logo.png
│
├── run.ps1                     ← Start script
├── README_QUICKSTART.md        ← Full documentation
└── ONBOARDING_CONSOLIDATION.md ← Why one version
```

---

## **✨ Features Available**

### **Customer Portal**
- ✅ Account opening in 5 minutes
- ✅ Resume incomplete applications
- ✅ AI chat assistant
- ✅ Document OCR (Aadhaar, PAN)
- ✅ Face verification
- ✅ Signature capture
- ✅ Multi-language support (EN, HI, MR)
- ✅ Accessibility controls (high contrast, font size)

### **Admin Dashboard**
- ✅ 5 sections (Engagement, Identity, Workflow, Compliance, Analytics)
- ✅ Real-time activity feed
- ✅ Fraud detection
- ✅ Verification queue
- ✅ Application approval/rejection
- ✅ Complete audit trail
- ✅ Risk scoring engine
- ✅ Analytics & reports

### **Backend APIs**
- ✅ 20 RESTful endpoints
- ✅ JWT authentication
- ✅ MongoDB persistence
- ✅ Groq AI integration
- ✅ Draft autosave
- ✅ Audit logging

---

## **🎓 Project Info**

| Item | Value |
|------|-------|
| **Backend** | Node.js + Express.js |
| **Frontend** | HTML5 + CSS3 + JavaScript |
| **Database** | MongoDB Atlas (Cloud) |
| **AI** | Groq API (Mixtral model) |
| **Auth** | JWT Tokens |
| **Server Port** | 3000 |
| **Framework** | Clean Architecture |

---

## **🚀 Just Start It!**

```powershell
cd C:\Users\dhruv\Desktop\De-coDe-main\De-coDe-main
.\run.ps1
```

**Wait 3-5 seconds for server to start...**

Then open:
- http://localhost:3000 (Customer)
- http://localhost:3000/#adminPortal (Admin with admin/Admin@123)

**That's it!** 🎉

---

## **📊 One-Page Checklist**

- [ ] Run `.\run.ps1`
- [ ] Wait for "FINGUARD Platform running" message
- [ ] Open http://localhost:3000
- [ ] Test customer onboarding
- [ ] Go to http://localhost:3000/#adminPortal
- [ ] Login with admin/Admin@123
- [ ] Review applications
- [ ] Done! ✅

---

**Happy Testing!** 🏦✨

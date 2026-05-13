# FINGUARD — AI-Driven Digital Onboarding & Risk Platform

## 📋 Project Overview

FINGUARD is an academic project demonstrating a modern AI-powered banking onboarding system with:

- **Smart Customer Onboarding**: Multi-step KYC/AML onboarding with OCR and biometric verification
- **Admin Dashboard**: Real-time application management and compliance tracking
- **AI Assistant**: Groq-powered intelligent agent guiding users through onboarding
- **Accessibility**: High contrast mode, adjustable font sizes, multilingual support
- **Audit Logging**: Complete audit trail of all customer and admin actions

## 🏗️ Architecture

```
FINGUARD/
├── backend/               # Node.js + Express API server
│   ├── src/
│   │   └── app.js        # Main Express application
│   ├── package.json
│   └── .env
│
├── frontend/             # Static HTML/CSS/JS
│   └── src/
│       ├── index.html    # Admin dashboard
│       ├── onboarding.html # Customer onboarding
│       └── agent-widget.js # AI assistant
│
└── shared/               # Shared constants
    └── constants/
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (if using Node)
cd ../frontend
npm install
```

### Running Locally

**Terminal 1 - Backend (Port 3000):**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend (Port 5173 or 8000):**
```bash
cd frontend
npm run dev
# OR use Python simple server:
python -m http.server 5173
```

Then open:
- **Onboarding**: http://localhost:3000/onboarding.html
- **Admin Dashboard**: http://localhost:3000/index.html
- **API**: http://localhost:3000/api

## 🔑 Features

### Customer Onboarding
1. Personal Information (Name, Contact, Address)
2. Aadhaar Upload & OCR Verification
3. PAN Card Upload & OCR Verification
4. Face & Signature Verification
5. Income & Employment Details
6. Risk Scoring & Assessment
7. Application Status Tracking

### Admin Dashboard
- View all applications with risk scores
- Approve/Reject applications
- View audit logs
- Filter and search applications
- Download reports (CSV, PDF)

### AI Assistant
- Contextual guidance during onboarding
- Risk explanations
- Document upload assistance
- Multi-language support

## 🔐 Demo Credentials

**Admin Portal:**
- Username: `admin`
- Password: `demo123`

## 📊 API Endpoints

### Applications
- `POST /api/applications/submit` — Submit new application
- `GET /api/applications` — List all applications
- `GET /api/applications/:id` — Get application details
- `PUT /api/applications/:id/approve` — Approve application
- `PUT /api/applications/:id/reject` — Reject application

### Audit Logs
- `GET /api/audit-logs` — View all audit logs

### AI Agent
- `POST /api/chat` — Send message to AI assistant

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI/ML**: Groq API (LLM), Tesseract.js (OCR), face-api.js (Face detection)
- **Database**: Local JSON (Phase 1), MongoDB (Phase 2+)
- **Document Processing**: PDF.js, Tesseract.js

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Specification](./docs/API.md)
- [Setup Guide](./docs/SETUP.md)

## 👥 Team Roles

- **Frontend + Accessibility**: UI/UX, onboarding flow, accessibility
- **Backend + Persistence**: APIs, authentication, database
- **AI/ML Integration**: OCR, face detection, AI assistant, risk engine

## 🎯 Current Phase

**Phase 1**: Architecture Refactor (Complete)
- ✅ Frontend/Backend separation
- ✅ Centralized configuration
- ✅ Service layer foundation
- ✅ Repository pattern setup

**Phase 2**: Real Backend & MongoDB (In Progress)
- 🔄 Centralized config files
- ⏳ Validation middleware
- ⏳ Service layer implementation
- ⏳ Repository layer refactoring
- ⏳ MongoDB integration

## 🚀 Future Enhancements

- Phase 3: AML/Compliance Engine
- Phase 4: Production Hardening & Security
- Phase 5: Comprehensive Testing Suite

## 📝 License

MIT License - See LICENSE file for details

## 👨‍💻 Authors

FINGUARD Development Team

---

## ☁️ Deployment Guide

### Stack
| Layer | Platform |
|---|---|
| Frontend | **Vercel** (static hosting) |
| Backend | **Render** (Node.js web service) |
| Database | **MongoDB Atlas** (free M0 cluster) |

---

### Step 1 — MongoDB Atlas

1. Log in at [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Network Access** → Add IP: `0.0.0.0/0` (allow all — needed for Render dynamic IPs)
3. **Database Access** → verify your user has `readWrite` on `finguard_db`
4. **Connect** → copy the `mongodb+srv://...` connection string

---

### Step 2 — Render (Backend)

1. Connect your GitHub repo at [render.com](https://render.com)
2. **New → Web Service**
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. **Environment Variables** (set in Render dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your Atlas URI>
   MONGO_URI=<same Atlas URI>
   JWT_SECRET=<generate a strong random string>
   GROQ_API_KEY=<your key from console.groq.com>
   GROQ_MODEL=llama-3.1-8b-instant
   DB_TYPE=mongodb
   CORS_ORIGIN=*
   ```
5. Deploy → wait for logs to show `🏦 FINGUARD Platform running on port 10000`
6. Note your Render URL: `https://finguard-backend.onrender.com`

---

### Step 3 — Update Frontend API URL

Before deploying to Vercel, open `frontend/src/index.html` and update the config block:

```html
<script>
    window.SBI_AGENT_CONFIG = {
        apiBase: 'https://finguard-backend.onrender.com'  // ← your Render URL
    };
</script>
```

Commit this change.

---

### Step 4 — Vercel (Frontend)

1. Connect your GitHub repo at [vercel.com](https://vercel.com)
2. **New Project** → import repo
3. Settings:
   - **Root Directory**: leave blank (vercel.json at repo root handles routing)
   - **Framework Preset**: Other
   - **Build Command**: *(leave empty)*
   - **Output Directory**: *(leave empty)*
4. Deploy → Vercel will use `vercel.json` for routing
5. Note your Vercel URL: `https://finguard.vercel.app`

---

### Step 5 — Post-Deploy Verification

```bash
# Check backend health
curl https://finguard-backend.onrender.com/health
# → {"status":"ok"}

# Check API health
curl https://finguard-backend.onrender.com/api/health
# → {"success":true,"status":"running","timestamp":"..."}
```

Then open your Vercel URL in a browser and verify:
- ✅ Page loads
- ✅ Admin login works
- ✅ AI chat responds
- ✅ Face-api models load (no 404s in network tab)
- ✅ Applications submit and appear in admin dashboard

---

### Required Environment Variables Summary

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | ✅ | Set to `production` on Render |
| `PORT` | ✅ | `10000` on Render |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Any strong random string |
| `GROQ_API_KEY` | ✅ | From console.groq.com |
| `GROQ_MODEL` | ✅ | `llama-3.1-8b-instant` |
| `DB_TYPE` | ✅ | `mongodb` |
| `CORS_ORIGIN` | ⚠️ | `*` for demo; set to Vercel URL for production |

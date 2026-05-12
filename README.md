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

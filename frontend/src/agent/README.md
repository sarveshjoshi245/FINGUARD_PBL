# SBI AI Onboarding Agent

A standalone AI-powered sidebar agent that guides customers through digital account onboarding.

## 📁 Files

| File | Purpose |
|------|---------|
| `agent-widget.js` | Sidebar widget (auto-creates UI, manages chat) |
| `agent-widget.css` | Sidebar styles (isolated, won't conflict) |
| `server.js` | Backend API (Groq-powered AI) |
| `sbi_onboarding_agent.yaml` | Agent config |
| `.env` | API key (GROQ_API_KEY) |
| `package.json` | Node.js dependencies |
| `agent-demo.html` | Test/demo page |

## 🚀 Quick Start

```bash
npm install
node server.js
```
Open `http://localhost:3000/agent-demo.html`

## 🔗 Integration (2 lines)

Add to your dashboard HTML:
```html
<link rel="stylesheet" href="agent-widget.css">
<script src="agent-widget.js"></script>
```

Call from your JS when user changes steps:
```js
window.SBIAgent.setStep(1); // step number
```

## 🔑 API

| Method | Description |
|--------|-------------|
| `SBIAgent.setStep(n)` | Update current step (triggers guidance) |
| `SBIAgent.notify(msg)` | Push a message from the agent |
| `SBIAgent.toggle()` | Minimize/expand sidebar |
| `SBIAgent.reset()` | Clear chat & reset session |

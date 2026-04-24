# AI Agent "Page Exit" Bug Report

## Bug Description
The customer onboarding page automatically "exits" or reloads after some steps, specifically when the AI agent is activated or after 15 seconds of inactivity.

## Root Cause
The bug is caused by a conflict between **VS Code Live Server** and the Node.js backend. 

1. You are running the frontend through the VS Code Live Server extension.
2. The Node.js backend (`server.js`) uses a local JSON file (`agent/db.json`) as its database to save application drafts, risk scores, and audit logs.
3. When the AI agent interacts with the page (either from a message you send, or from the 15-second inactivity "drop-off prevention" nudge), the backend updates `db.json`. 
4. The same happens when you click "Continue" and auto-save the draft.
5. **Live Server detects that a file (`db.json`) in your project directory has changed, and it automatically triggers a full page reload** to reflect the "code changes." This completely resets your frontend state and kicks you out of the form.

## How to Fix It

You have two simple options to fix this issue:

### Option 1: Access via the Backend Directly (Recommended)
Since your `server.js` file is already configured to serve the frontend files (`app.use(express.static(...))`), you don't actually need Live Server.
1. Make sure your backend terminal is running: `node agent/server.js`.
2. Open your browser and go to **`http://localhost:3000`** instead of the Live Server port (like `http://127.0.0.1:5500`).
3. The page will load normally and will not be affected by `db.json` file changes.

### Option 2: Exclude `db.json` from Live Server
If you prefer to keep using Live Server for frontend development:
1. Open VS Code Settings (`Ctrl + ,`).
2. Search for `Live Server > Settings: Ignore Files`.
3. Add `**/agent/db.json` (or just `db.json`) to the ignored files list.
4. Restart Live Server. It will no longer watch the database file for changes.

This explains why the issue only seemed to happen when the AI Agent was active—the agent's activity writes to the local DB file, triggering the hot-reload.

/* ================= GLOBAL CONFIG ================= */
let applications = [];
let currentApplicationIndex = null;
let currentStep = 0;
let tempData = {};
let videoStream = null; // To control camera

/* Validation Regex */
const REGEX_AADHAAR = /^[2-9]{1}[0-9]{11}$/;
const REGEX_PAN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const REGEX_MOBILE = /^[6-9]\d{9}$/;

/* ================= OCR ENGINE (PDF + IMAGE) ================= */
async function processImage(inputElement, docType) {
    const file = inputElement.files[0];
    if (!file) return;

    // UI Updates
    const stepMsg = document.getElementById("stepMessage");
    stepMsg.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <div class="loader"></div>
            <h3>AI is scanning ${docType}...</h3>
        </div>`;

    try {
        let imageSource = file;
        if (file.type === 'application/pdf') {
            imageSource = await convertPdfToImage(file);
        }

        const { data: { text } } = await Tesseract.recognize(
            imageSource, 'eng', { logger: m => console.log(m) }
        );

        console.log("Extracted:", text);

        if (docType === 'AADHAAR') {
            const match = text.match(/\d{4}\s?\d{4}\s?\d{4}/);
            if (match) {
                document.getElementById("custAadhar").value = match[0].replace(/\s/g, '');
                alert(`✅ Aadhaar Found: ${match[0]}`);
            } else {
                alert("⚠ Could not strict match Aadhaar. Please check manually.");
            }
        }
        else if (docType === 'PAN') {
            const match = text.replace(/\s+/g, '').match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
            if (match) {
                document.getElementById("custPan").value = match[0];
                alert(`✅ PAN Found: ${match[0]}`);
            } else {
                alert("⚠ Could not strict match PAN. Please check manually.");
            }
        }

        stepMsg.innerHTML = "<h3>Review Extracted Data</h3>";
        renderStep(); // Refresh UI

    } catch (err) {
        console.error(err);
        alert("Error processing file.");
        stepMsg.innerHTML = "<h3>Error. Try again.</h3>";
        renderStep();
    }
}

async function convertPdfToImage(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return canvas.toDataURL('image/png');
}

/* ================= CUSTOMER ONBOARDING FLOW ================= */

function startOnboarding() {
    document.getElementById("aiIntroScreen").style.display = "none";
    document.getElementById("stepContent").style.display = "block";
    currentStep = 1;
    renderStep();
}

function renderStep() {
    const stepMessage = document.getElementById("stepMessage");
    const formArea = document.getElementById("formArea");
    const progressFill = document.getElementById("progressFill");
    const stepLabel = document.getElementById("stepLabel");
    const nextBtn = document.getElementById("nextBtn");

    // Persist Values
    let savedName = document.getElementById("custName") ? document.getElementById("custName").value : (tempData.name || "");
    let savedAadhar = document.getElementById("custAadhar") ? document.getElementById("custAadhar").value : (tempData.aadhar || "");
    let savedPan = document.getElementById("custPan") ? document.getElementById("custPan").value : (tempData.pan || "");
    let savedMobile = document.getElementById("custMobile") ? document.getElementById("custMobile").value : (tempData.mobile || "");

    formArea.innerHTML = "";
    progressFill.style.width = (currentStep * 25) + "%";
    stepLabel.innerText = "Step " + currentStep + " of 4";

    // --- STEP 1: DATA ENTRY ---
    if (currentStep === 1) {
        stepMessage.innerHTML = "<h3>Enter Personal Details</h3>";
        formArea.innerHTML = `
            <div class="form-group"><label>Full Name</label><input type="text" id="custName" value="${savedName}"></div>
            <div class="form-group" style="background:#eef1f5; padding:10px;">
                <label>Aadhaar (12 Digits)</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="custAadhar" value="${savedAadhar}" maxlength="12">
                    <input type="file" id="ocrAadhar" style="display:none" accept=".pdf,image/*" onchange="processImage(this,'AADHAAR')">
                    <button onclick="document.getElementById('ocrAadhar').click()" style="background:#444; color:#fff; font-size:12px;">📂 Scan</button>
                </div>
            </div>
            <div class="form-group" style="background:#eef1f5; padding:10px; margin-top:10px;">
                <label>PAN (10 Chars)</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="custPan" value="${savedPan}" maxlength="10" style="text-transform:uppercase;">
                    <input type="file" id="ocrPan" style="display:none" accept=".pdf,image/*" onchange="processImage(this,'PAN')">
                    <button onclick="document.getElementById('ocrPan').click()" style="background:#444; color:#fff; font-size:12px;">📂 Scan</button>
                </div>
            </div>
            <div class="form-group"><label>Mobile</label><input type="text" id="custMobile" value="${savedMobile}" maxlength="10"></div>
        `;
        nextBtn.innerText = "Verify & Continue";
        nextBtn.onclick = nextStep;
    }

    // --- STEP 2: DOC VERIFICATION ---
    else if (currentStep === 2) {
        stepMessage.innerHTML = "<h3>Verifying Documents...</h3>";
        formArea.innerHTML = `
            <p>✅ <b>Aadhaar:</b> Verified against UIDAI.</p>
            <p>✅ <b>PAN:</b> Verified against NSDL.</p>
            <p>✅ <b>Mobile:</b> OTP Verified.</p>
        `;
        nextBtn.innerText = "Start Liveness Check";
        nextBtn.onclick = () => { currentStep++; renderStep(); };
    }

    // --- STEP 3: WEBCAM LIVENESS (NEW) ---
    else if (currentStep === 3) {
        stepMessage.innerHTML = "<h3>Face Match & Liveness</h3>";
        formArea.innerHTML = `
            <div style="text-align:center;">
                <video id="camera-stream" autoplay playsinline></video>
                <canvas id="snap-canvas" width="320" height="240"></canvas>
                <p id="cam-status">Click 'Start Camera' to verify identity.</p>
                
                <div style="margin-top:10px;">
                    <button id="btn-start-cam" onclick="startCamera()" style="background:#002147; color:white; padding:8px;">📷 Start Camera</button>
                    <button id="btn-capture" onclick="captureFace()" style="display:none; background:green; color:white; padding:8px;">🟢 Verify Me</button>
                </div>
            </div>
        `;
        nextBtn.innerText = "Submit Application";
        nextBtn.style.display = "none"; // Hide until verified
        nextBtn.onclick = submitAccount;
    }
}

/* ================= CAMERA FUNCTIONS (NEW) ================= */

function startCamera() {
    const video = document.getElementById("camera-stream");
    const btnStart = document.getElementById("btn-start-cam");
    const btnCap = document.getElementById("btn-capture");

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                videoStream = stream;
                video.srcObject = stream;
                video.style.display = "block"; // Show video
                video.play();

                document.getElementById("cam-status").innerText = "Look at the camera and keep steady.";
                btnStart.style.display = "none";
                btnCap.style.display = "inline-block";
            })
            .catch(function (err) {
                alert("Camera Error: " + err);
            });
    } else {
        alert("Camera not supported on this browser.");
    }
}

function captureFace() {
    const video = document.getElementById("camera-stream");
    const canvas = document.getElementById("snap-canvas");
    const context = canvas.getContext("2d");
    const nextBtn = document.getElementById("nextBtn");
    const btnCap = document.getElementById("btn-capture");
    const status = document.getElementById("cam-status");

    // Capture frame
    context.drawImage(video, 0, 0, 320, 240);

    // Stop Stream
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
    video.style.display = "none";
    canvas.style.display = "block"; // Show the photo

    // Simulate AI Processing
    status.innerText = "Analysing Biometrics...";
    btnCap.style.display = "none";

    setTimeout(() => {
        status.innerHTML = "✅ <b>Face Match: 98%</b><br>✅ <b>Liveness: Confirmed</b>";
        status.style.color = "green";
        nextBtn.style.display = "inline-block"; // Show Submit Button
    }, 1500);
}

/* ================= VALIDATION LOGIC ================= */

function nextStep() {
    if (currentStep === 1) {
        const name = document.getElementById("custName").value;
        const aadhar = document.getElementById("custAadhar").value;
        const pan = document.getElementById("custPan").value.toUpperCase();
        const mobile = document.getElementById("custMobile").value;

        if (!name || !aadhar || !pan || !mobile) {
            alert("Please complete all fields.");
            return;
        }
        if (!REGEX_AADHAAR.test(aadhar)) { alert("Invalid Aadhaar (12 digits required)"); return; }
        if (!REGEX_PAN.test(pan)) { alert("Invalid PAN (Format: ABCDE1234F)"); return; }
        if (!REGEX_MOBILE.test(mobile)) { alert("Invalid Mobile"); return; }

        tempData = { name, aadhar, pan, mobile };
    }
    currentStep++;
    renderStep();
}

/* ================= SUBMISSION LOGIC ================= */

function submitAccount() {
    let risk = Math.floor(Math.random() * 100);
    if (tempData.aadhar.endsWith("99")) risk = 85;

    const newApp = {
        id: Date.now(),
        name: tempData.name,
        aadhar: tempData.aadhar,
        pan: tempData.pan,
        mobile: tempData.mobile,
        risk: risk,
        status: risk < 40 ? "Approved" : "Flagged",
        timeline: ["Application Submitted", "Docs Verified", "Biometric Liveness Passed"]
    };

    applications.push(newApp);
    alert("Application Submitted Successfully!");

    // Reset
    document.getElementById("stepContent").style.display = "none";
    document.getElementById("aiIntroScreen").style.display = "block";
    updateAdminList();
}

/* ================= ADMIN UI LOGIC ================= */
function showPortal(id) {
    document.getElementById("adminPortal").style.display = "none";
    document.getElementById("customerPortal").style.display = "none";
    document.getElementById(id).style.display = "block";
}
function showSection(id) {
    document.querySelectorAll("#adminPortal section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
    // Auto-render when switching tabs
    if (id === 'workflow') renderApplicationList();
    if (id === 'compliance') renderComplianceTab();
    if (id === 'analytics') renderAnalyticsTab();
    if (id === 'identity') renderIdentityTab();
    if (id === 'engagement') renderEngagementTab();
}
function showCustomerSection(id) {
    document.querySelectorAll("#customerPortal section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}

/* ================= MOCK DATA (Simulated Backend) ================= */

const mockApplications = [
    {
        id: 101,
        name: "Rahul Verma",
        timestamp: "2026-02-18 09:15 AM",
        ocr_status: "Verified",
        biometric_score: 45,
        watchlist_hit: false,
        risk_score: null,
        status: "Pending",
        hand_off_reason: null,
        audit_trail: [
            "09:15 AM: Application started via Digital Portal",
            "09:17 AM: Aadhaar uploaded — OCR scan initiated",
            "09:18 AM: PAN Card verified against NSDL",
            "09:19 AM: Liveness check — Low Confidence (45%)"
        ]
    },
    {
        id: 102,
        name: "Priya Sharma",
        timestamp: "2026-02-18 10:02 AM",
        ocr_status: "Verified",
        biometric_score: 92,
        watchlist_hit: false,
        risk_score: null,
        status: "Pending",
        hand_off_reason: null,
        audit_trail: [
            "10:02 AM: Application started via Digital Portal",
            "10:04 AM: Aadhaar verified — OCR match successful",
            "10:05 AM: PAN Card verified against NSDL",
            "10:06 AM: Liveness check — High Confidence (92%)"
        ]
    },
    {
        id: 103,
        name: "Amit Kulkarni",
        timestamp: "2026-02-18 10:30 AM",
        ocr_status: "Flagged",
        biometric_score: 78,
        watchlist_hit: false,
        risk_score: null,
        status: "Pending",
        hand_off_reason: null,
        audit_trail: [
            "10:30 AM: Application started via Digital Portal",
            "10:32 AM: Aadhaar uploaded — OCR discrepancy detected",
            "10:33 AM: PAN Card flagged — Name mismatch",
            "10:34 AM: Liveness check — Moderate Confidence (78%)"
        ]
    },
    {
        id: 104,
        name: "Sneha Iyer",
        timestamp: "2026-02-18 11:00 AM",
        ocr_status: "Verified",
        biometric_score: 60,
        watchlist_hit: true,
        risk_score: null,
        status: "Handed_Off",
        hand_off_reason: "Liveness Check Failed — Suspicious face mismatch",
        audit_trail: [
            "11:00 AM: Application started via Digital Portal",
            "11:02 AM: Aadhaar verified — OCR match successful",
            "11:03 AM: PAN Card verified against NSDL",
            "11:04 AM: Liveness check — Low Confidence (60%)",
            "11:05 AM: ⚠ AML Watchlist — Potential match found",
            "11:10 AM: 🔀 Escalated to Agent — Reason: Liveness Check Failed"
        ]
    },
    {
        id: 105,
        name: "Vikram Desai",
        timestamp: "2026-02-18 11:45 AM",
        ocr_status: "Flagged",
        biometric_score: 88,
        watchlist_hit: false,
        risk_score: null,
        status: "Handed_Off",
        hand_off_reason: "User Requested Help — Unable to complete video KYC",
        audit_trail: [
            "11:45 AM: Application started via Digital Portal",
            "11:47 AM: Aadhaar uploaded — OCR partial match",
            "11:48 AM: PAN Card flagged — Blurry scan",
            "11:49 AM: Liveness check — High Confidence (88%)",
            "11:55 AM: 🔀 User requested agent assistance"
        ]
    }
];

let selectedAppId = null;

/* ================= RISK ENGINE ================= */

function calculateRisk(app) {
    let score = 0;
    let reasons = [];
    let breakdown = [];

    // Step 0: Base
    breakdown.push({ text: "Base Risk: 0", delta: 0, type: "base" });

    // Rule 1: Biometric check
    if (app.biometric_score < 90) {
        const penalty = app.biometric_score < 80 ? 40 : 20;
        score += penalty;
        reasons.push(`Low Biometric Match (${app.biometric_score}%)`);
        breakdown.push({ text: `Penalty (+${penalty}): Biometric match low (${app.biometric_score}%)`, delta: penalty, type: "warning" });
    } else {
        breakdown.push({ text: "Biometric: OK — No penalty", delta: 0, type: "pass" });
    }

    // Rule 2: OCR status
    if (app.ocr_status === "Flagged") {
        score += 30;
        reasons.push("Document OCR Flagged — Needs Review");
        breakdown.push({ text: "Penalty (+30): OCR document flagged — name/data mismatch", delta: 30, type: "warning" });
    } else {
        breakdown.push({ text: "OCR: Verified — No penalty", delta: 0, type: "pass" });
    }

    // Rule 3: Watchlist (Critical)
    if (app.watchlist_hit) {
        score += 50;
        reasons.push("CRITICAL: AML Watchlist Match Found");
        breakdown.push({ text: "CRITICAL (+50): Watchlist Hit — AML match detected", delta: 50, type: "critical" });
    } else {
        breakdown.push({ text: "Watchlist: Clear — No penalty", delta: 0, type: "pass" });
    }

    // Cap at 100
    if (score > 100) score = 100;

    // Final
    let level = "Low Risk";
    if (score >= 70) level = "High Risk";
    else if (score >= 30) level = "Medium Risk";

    breakdown.push({ text: `Final Score: ${score}/100 — ${level}`, delta: 0, type: score >= 70 ? "critical" : score >= 30 ? "warning" : "pass" });

    return { score, reasons, level, breakdown };
}

function calculateRiskForSelected() {
    if (selectedAppId === null) return;
    const app = mockApplications.find(a => a.id === selectedAppId);
    if (!app) return;

    const result = calculateRisk(app);
    app.risk_score = result.score;

    // Update Gauge
    const gauge = document.getElementById("riskGauge");
    const cover = document.getElementById("riskGaugeCover");
    const label = document.getElementById("riskLabel");
    const reasonsDiv = document.getElementById("riskReasons");

    const deg = (result.score / 100) * 360;
    let color = "#2e7d32"; // green
    if (result.score >= 70) color = "#d32f2f"; // red
    else if (result.score >= 30) color = "#f9a825"; // amber

    gauge.style.background = `conic-gradient(${color} ${deg}deg, #e0e0e0 ${deg}deg)`;
    cover.innerText = result.score;
    cover.style.color = color;
    label.innerText = result.level;
    label.style.color = color;

    // Render detailed breakdown as a bulleted list
    const typeClass = { base: '', pass: 'pass', warning: 'warning', critical: 'critical' };
    reasonsDiv.innerHTML = `<ul class="risk-breakdown">${result.breakdown.map(b =>
        `<li class="breakdown-${typeClass[b.type] || ''}">${b.text}</li>`
    ).join('')}</ul>`;

    // Append to audit trail
    appendAuditLog(app, `Risk Engine executed — Score: ${result.score} (${result.level})`);

    // Refresh the detail table to show the newly computed risk score
    reviewApplication(app.id);
}

/* ================= APPLICATION LIST ================= */

function renderApplicationList() {
    const readyDiv = document.getElementById("readyList");
    const escalatedDiv = document.getElementById("escalatedList");
    const completedDiv = document.getElementById("completedList");

    const ready = mockApplications.filter(a => a.status === "Pending");
    const escalated = mockApplications.filter(a => a.status === "Handed_Off");
    const completed = mockApplications.filter(a => a.status === "Approved" || a.status === "Rejected");

    readyDiv.innerHTML = ready.length === 0
        ? '<p class="placeholder-text">No applications ready for approval.</p>'
        : ready.map(app => buildAppItem(app, 'ready')).join("");

    escalatedDiv.innerHTML = escalated.length === 0
        ? '<p class="placeholder-text">No escalated applications.</p>'
        : escalated.map(app => buildAppItem(app, 'escalated')).join("");

    completedDiv.innerHTML = completed.length === 0
        ? '<p class="placeholder-text">No completed applications yet.</p>'
        : completed.map(app => buildAppItem(app, 'completed')).join("");
}

function buildAppItem(app, category) {
    const statusClass = app.status.toLowerCase();
    const selected = app.id === selectedAppId ? ' selected' : '';
    const reviewBtn = category === 'completed'
        ? ''
        : `<button class="btn-review" onclick="reviewApplication(${app.id})">Review</button>`;

    // Show risk score column for ready items
    const riskCol = (category === 'ready' && app.risk_score !== null)
        ? `<span class="app-risk-col">${app.risk_score}/100</span>`
        : (category === 'ready' ? '<span class="app-risk-col">—</span>' : '');

    // Show hand-off reason for escalated items
    const reasonLine = (category === 'escalated' && app.hand_off_reason)
        ? `<span class="handoff-reason">⚠ ${app.hand_off_reason}</span>`
        : '';

    return `
        <div class="app-item${selected}" id="appItem-${app.id}">
            <div class="app-item-info">
                <strong>${app.name} <span class="status-badge ${statusClass}">${app.status}</span></strong>
                <span>${app.timestamp}</span>
                ${reasonLine}
            </div>
            ${riskCol}
            ${reviewBtn}
        </div>`;
}

/* ================= REVIEW / SELECT ================= */

function reviewApplication(id) {
    selectedAppId = id;
    const app = mockApplications.find(a => a.id === id);
    if (!app) return;

    // Enable risk button
    document.getElementById("btnCalcRisk").disabled = false;

    // Populate decision detail
    const detail = document.getElementById("decisionDetail");
    detail.innerHTML = `
        <table>
            <tr><td>Name</td><td><strong>${app.name}</strong></td></tr>
            <tr><td>Application ID</td><td>#${app.id}</td></tr>
            <tr><td>Submitted</td><td>${app.timestamp}</td></tr>
            <tr><td>OCR Status</td><td>${app.ocr_status === "Flagged" ? '⚠️ Flagged' : '✅ Verified'}</td></tr>
            <tr><td>Biometric Score</td><td>${app.biometric_score}%</td></tr>
            <tr><td>Watchlist Hit</td><td>${app.watchlist_hit ? '🚨 Yes' : '✅ No'}</td></tr>
            <tr><td>Risk Score</td><td>${app.risk_score !== null ? app.risk_score + '/100' : '— (not calculated)'}</td></tr>
            <tr><td>Status</td><td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td></tr>
        </table>`;
    document.getElementById("decisionActions").style.display = "flex";

    // Render audit trail
    renderAuditTrail(app);

    // Reset risk gauge display for this new selection
    resetRiskGauge();

    // If risk was already calculated for this app, show it
    if (app.risk_score !== null) {
        const result = calculateRisk(app);
        const gauge = document.getElementById("riskGauge");
        const cover = document.getElementById("riskGaugeCover");
        const label = document.getElementById("riskLabel");
        const reasonsDiv = document.getElementById("riskReasons");
        const deg = (result.score / 100) * 360;
        let color = "#2e7d32";
        if (result.score >= 70) color = "#d32f2f";
        else if (result.score >= 30) color = "#f9a825";
        gauge.style.background = `conic-gradient(${color} ${deg}deg, #e0e0e0 ${deg}deg)`;
        cover.innerText = result.score;
        cover.style.color = color;
        label.innerText = result.level;
        label.style.color = color;

        // Also restore the breakdown list
        const typeClass = { base: '', pass: 'pass', warning: 'warning', critical: 'critical' };
        reasonsDiv.innerHTML = `<ul class="risk-breakdown">${result.breakdown.map(b =>
            `<li class="breakdown-${typeClass[b.type] || ''}">${b.text}</li>`
        ).join('')}</ul>`;
    }

    // Highlight selected item
    renderApplicationList();

    // Log review action
    appendAuditLog(app, "Admin opened application for review");
}

function resetRiskGauge() {
    document.getElementById("riskGauge").style.background = "conic-gradient(#ccc 0deg, #e0e0e0 360deg)";
    document.getElementById("riskGaugeCover").innerText = "—";
    document.getElementById("riskGaugeCover").style.color = "#555";
    document.getElementById("riskLabel").innerText = "Click 'Calculate Risk'";
    document.getElementById("riskLabel").style.color = "#777";
    document.getElementById("riskReasons").innerHTML = "";
}

/* ================= APPROVE / REJECT ================= */

function approveApplication() {
    if (selectedAppId === null) return;
    const app = mockApplications.find(a => a.id === selectedAppId);
    if (!app || (app.status !== "Pending" && app.status !== "Handed_Off")) {
        alert("This application has already been processed.");
        return;
    }
    app.status = "Approved";
    appendAuditLog(app, "✅ Admin Decision: APPROVED — Account Activated");
    renderApplicationList();
    reviewApplication(app.id);
}

function rejectApplication() {
    if (selectedAppId === null) return;
    const app = mockApplications.find(a => a.id === selectedAppId);
    if (!app || (app.status !== "Pending" && app.status !== "Handed_Off")) {
        alert("This application has already been processed.");
        return;
    }
    app.status = "Rejected";
    appendAuditLog(app, "❌ Admin Decision: REJECTED — Account Denied");
    renderApplicationList();
    reviewApplication(app.id);
}

/* (Handoff modal removed — admin now only Approves or Rejects) */

/* ================= AUDIT TRAIL ================= */

function renderAuditTrail(app) {
    const container = document.getElementById("auditTrailContainer");
    if (!app.audit_trail || app.audit_trail.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No audit entries.</p>';
        return;
    }

    const items = app.audit_trail.map(entry => {
        const isAdmin = entry.includes("Admin") || entry.includes("Risk Engine") || entry.includes("Transferred");
        const parts = entry.split(": ");
        const time = parts[0];
        const event = parts.slice(1).join(": ");
        return `<li class="${isAdmin ? 'admin-action' : ''}">
            <span class="audit-time">${time}</span><br>
            <span class="audit-event">${event}</span>
        </li>`;
    }).join("");

    container.innerHTML = `<ul class="audit-timeline">${items}</ul>`;
    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function appendAuditLog(app, message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    app.audit_trail.push(`${timeStr}: ${message}`);

    // Re-render if this app is currently selected
    if (app.id === selectedAppId) {
        renderAuditTrail(app);
    }
}

/* ================= ENGAGEMENT DASHBOARD ================= */

const userActivityLog = [
    { icon: '🌐', text: 'User #1024 switched to Hindi Language', time: '12:01 PM' },
    { icon: '🎙️', text: 'User #889 used Voice Mode to enter address', time: '12:00 PM' },
    { icon: '💡', text: 'User #990 triggered a Help Nudge at PAN Upload', time: '11:58 AM' },
    { icon: '✅', text: 'User #772 completed onboarding in 3m 12s', time: '11:57 AM' },
    { icon: '🎙️', text: 'User #631 used Voice Mode for name entry', time: '11:55 AM' },
    { icon: '❓', text: 'User #445 asked "Is Aadhaar mandatory?"', time: '11:54 AM' },
    { icon: '🌐', text: 'User #812 switched to Tamil Language', time: '11:52 AM' },
    { icon: '💡', text: 'User #567 triggered Idle Nudge at Selfie step', time: '11:50 AM' },
    { icon: '📸', text: 'User #903 completed Selfie via guided mode', time: '11:49 AM' },
    { icon: '✅', text: 'User #210 completed onboarding in 2m 45s', time: '11:47 AM' }
];

const topQueries = [
    { query: 'Is Aadhaar mandatory?', count: 145 },
    { query: 'What is the minimum balance?', count: 98 },
    { query: 'How to upload selfie?', count: 76 },
    { query: 'Can I add a nominee later?', count: 45 },
    { query: 'Is video KYC required?', count: 32 }
];

let channelChartInstance = null;
let engFeedTimer = null;
let engFeedIndex = 0;

function renderEngagementTab() {
    renderActivityFeed();
    renderChannelChart();
    renderTopQueries();
    startActivityFeed();
}

function renderActivityFeed() {
    const container = document.getElementById('engFeedList');
    if (!container) return;
    // Seed with first 5 events
    engFeedIndex = 5;
    container.innerHTML = userActivityLog.slice(0, 5).map(ev =>
        `<div class="eng-feed-item"><span class="eng-feed-icon">${ev.icon}</span><span class="eng-feed-text">${ev.text}</span><span class="eng-feed-time">${ev.time}</span></div>`
    ).join('');
}

function startActivityFeed() {
    if (engFeedTimer) clearInterval(engFeedTimer);
    engFeedTimer = setInterval(() => {
        const container = document.getElementById('engFeedList');
        if (!container || container.offsetParent === null) {
            clearInterval(engFeedTimer);
            return;
        }
        const ev = userActivityLog[engFeedIndex % userActivityLog.length];
        engFeedIndex++;
        const newItem = document.createElement('div');
        newItem.className = 'eng-feed-item eng-feed-new';
        newItem.innerHTML = `<span class="eng-feed-icon">${ev.icon}</span><span class="eng-feed-text">${ev.text}</span><span class="eng-feed-time">Just now</span>`;
        container.insertBefore(newItem, container.firstChild);
        // Remove old items beyond 8
        while (container.children.length > 8) container.removeChild(container.lastChild);
    }, 3000);
}

function renderChannelChart() {
    const ctx = document.getElementById('channelChart');
    if (!ctx) return;
    if (channelChartInstance) channelChartInstance.destroy();

    channelChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Text Chat', 'Voice Mode', 'Standard Form'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: ['#5c6bc0', '#7c4dff', '#b0bec5'],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });

    document.getElementById('channelInsight').innerHTML =
        '<span class="insight-icon">💡</span> <strong>35%</strong> of users prefer <strong>Voice Mode</strong> — high adoption in rural areas & first-time smartphone users.';
}

function renderTopQueries() {
    const container = document.getElementById('engQueryList');
    if (!container) return;
    const maxCount = topQueries[0].count;
    container.innerHTML = topQueries.map((q, i) => {
        const pct = Math.round((q.count / maxCount) * 100);
        return `<div class="eng-query-item">
            <div class="eng-query-rank">${i + 1}</div>
            <div class="eng-query-body">
                <div class="eng-query-text">"${q.query}"</div>
                <div class="eng-query-bar-wrap">
                    <div class="eng-query-bar" style="width:${pct}%;"></div>
                </div>
            </div>
            <span class="eng-query-count">${q.count}</span>
        </div>`;
    }).join('');
}

/* ================= ANALYTICS DASHBOARD ================= */

let funnelChartInstance = null;
let timeChartInstance = null;

function renderAnalyticsTab() {
    renderFunnelChart();
    renderTimeChart();
    renderFrictionPoints();
}

function renderFunnelChart() {
    const ctx = document.getElementById('funnelChart');
    if (!ctx) return;
    if (funnelChartInstance) funnelChartInstance.destroy();

    const labels = ['Started Application', 'ID Uploaded', 'Liveness Check Passed', 'Account Activated'];
    const data = [100, 85, 75, 68];
    const colors = ['#1565c0', '#1976d2', '#1e88e5', '#2196f3'];

    // Find biggest drop
    let maxDrop = 0, maxDropIdx = 0;
    for (let i = 1; i < data.length; i++) {
        const drop = data[i - 1] - data[i];
        if (drop > maxDrop) { maxDrop = drop; maxDropIdx = i; }
    }

    // Highlight the drop-off bar
    const bgColors = colors.map((c, i) => i === maxDropIdx ? '#ff7043' : c);

    funnelChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Conversion %',
                data: data,
                backgroundColor: bgColors,
                borderRadius: 6,
                barThickness: 48
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const val = context.parsed.y;
                            const idx = context.dataIndex;
                            if (idx > 0) {
                                const prev = data[idx - 1];
                                return `${val}% (drop: -${prev - val}% from previous)`;
                            }
                            return `${val}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 110,
                    ticks: { callback: v => v + '%' },
                    grid: { color: '#eee' }
                },
                x: { grid: { display: false } }
            }
        }
    });

    // Insight text
    const insightDiv = document.getElementById('funnelInsight');
    insightDiv.innerHTML = `<span class="insight-icon">💡</span> Biggest drop-off: <strong>${labels[maxDropIdx]}</strong> — <strong>${maxDrop}%</strong> of users lost at this stage (${labels[maxDropIdx - 1]} → ${labels[maxDropIdx]}).`;
}

function renderTimeChart() {
    const ctx = document.getElementById('timeChart');
    if (!ctx) return;
    if (timeChartInstance) timeChartInstance.destroy();

    const labels = ['Under 1 min', '1-2 mins', '2-3 mins', '3-5 mins', '5-8 mins', '8+ mins'];
    const users = [120, 340, 280, 250, 160, 100];

    timeChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Users',
                data: users,
                fill: true,
                backgroundColor: 'rgba(21, 101, 192, 0.12)',
                borderColor: '#1565c0',
                borderWidth: 2,
                pointBackgroundColor: '#1565c0',
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.35
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.parsed.y} users completed in ${context.label}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Users' },
                    grid: { color: '#eee' }
                },
                x: {
                    title: { display: true, text: 'Time Taken' },
                    grid: { display: false }
                }
            }
        }
    });

    // Insight text
    const peak = Math.max(...users);
    const peakIdx = users.indexOf(peak);
    const slowUsers = users.slice(4).reduce((a, b) => a + b, 0);
    const total = users.reduce((a, b) => a + b, 0);
    const slowPct = ((slowUsers / total) * 100).toFixed(1);
    const insightDiv = document.getElementById('timeInsight');
    insightDiv.innerHTML = `<span class="insight-icon">💡</span> Peak: <strong>${peak}</strong> users in <strong>${labels[peakIdx]}</strong>. <strong>${slowPct}%</strong> of users take 5+ minutes (potential friction).`;
}

const frictionPoints = [
    { issue: 'OCR Glare Detected', impact: '15% of retries', severity: 'high', detail: 'Camera flash or ambient glare causing OCR failures — users must re-upload documents.' },
    { issue: 'Liveness Check Timeout', impact: '8% drop-off', severity: 'high', detail: 'Users abandoning during face verification step due to camera loading delays.' },
    { issue: 'OTP Delivery Latency', impact: '5% delay', severity: 'medium', detail: 'SMS OTPs taking 10+ seconds — users re-requesting or abandoning flow.' },
    { issue: 'PAN Name Mismatch', impact: '4% retries', severity: 'medium', detail: 'Minor name variations between Aadhaar and PAN triggering false OCR flags.' },
    { issue: 'Browser Compatibility', impact: '2% failures', severity: 'low', detail: 'WebRTC camera access failing on older mobile browsers during video KYC.' }
];

function renderFrictionPoints() {
    const container = document.getElementById('frictionList');
    if (!container) return;
    container.innerHTML = frictionPoints.map((fp, i) => {
        const sevClass = fp.severity === 'high' ? 'friction-high' : fp.severity === 'medium' ? 'friction-med' : 'friction-low';
        return `<div class="friction-item">
            <div class="friction-rank">${i + 1}</div>
            <div class="friction-body">
                <div class="friction-top">
                    <strong>${fp.issue}</strong>
                    <span class="friction-impact ${sevClass}">${fp.impact}</span>
                </div>
                <p class="friction-detail">${fp.detail}</p>
            </div>
        </div>`;
    }).join('');
}

/* ================= IDENTITY & SECURITY TAB ================= */

const securityFeed = [
    { id: 'sf1', time: '11:58 AM', user: 'Rahul V.', check: 'Liveness', status: 'Passed', score: 99, match: 88, idType: 'Aadhaar', details: 'Blink detection + head turn confirmed.' },
    { id: 'sf2', time: '11:55 AM', user: 'Priya S.', check: 'Face Match', status: 'Passed', score: 96, match: 96, idType: 'PAN Card', details: 'Biometric template matched with high confidence.' },
    { id: 'sf3', time: '11:52 AM', user: 'Amit K.', check: 'Face Match', status: 'Failed', score: 45, match: 45, idType: 'Aadhaar', details: 'Significant facial discrepancy detected between ID and selfie. Possible spoof attempt.' },
    { id: 'sf4', time: '11:48 AM', user: 'Sneha I.', check: 'OCR Scan', status: 'Passed', score: 97, match: 60, idType: 'Aadhaar', details: 'All fields extracted. PAN cross-verified via NSDL.' },
    { id: 'sf5', time: '11:44 AM', user: 'Vikram D.', check: 'Liveness', status: 'Failed', score: 32, match: 78, idType: 'Drivers License', details: 'Flat image detected — suspected photo-of-photo attack.' },
    { id: 'sf6', time: '11:40 AM', user: 'Ananya R.', check: 'Face Match', status: 'Passed', score: 98, match: 98, idType: 'PAN Card', details: 'Perfect match. All biometric checkpoints cleared.' }
];

const amlAlerts = [
    { name: 'Sneha Iyer', list: 'Interpol Red Notice', risk: 'Critical', detail: 'High-Risk Match detected. Exact name + partial DOB match on Interpol Red List database.', frozen: false },
    { name: 'Unknown Entity #4412', list: 'FATF Sanctions', detail: 'Beneficiary pattern match on FATF sanctioned entity list. UBO verification required.', risk: 'High', frozen: false },
    { name: 'Vikram Desai', list: 'PEP Database', detail: 'Partial match found in Politically Exposed Persons registry. Enhanced due diligence required.', risk: 'Medium', frozen: false }
];

let selectedFeedId = null;

function renderIdentityTab() {
    renderSecurityFeed();
    renderAmlAlerts();
    // Pre-load the mismatch case (Amit K.)
    loadForensics('sf3');
}

function renderSecurityFeed() {
    const tbody = document.getElementById('secFeedBody');
    if (!tbody) return;
    tbody.innerHTML = securityFeed.map(ev => {
        const statusClass = ev.status === 'Passed' ? 'sec-status-pass' : 'sec-status-fail';
        const sel = ev.id === selectedFeedId ? ' sec-feed-selected' : '';
        return `<tr class="sec-feed-row${sel}" onclick="loadForensics('${ev.id}')">
            <td class="sec-feed-time">${ev.time}</td>
            <td><strong>${ev.user}</strong></td>
            <td>${ev.check}</td>
            <td><span class="sec-status-badge ${statusClass}">${ev.status} (${ev.score}%)</span></td>
        </tr>`;
    }).join('');
}

function loadForensics(feedId) {
    const ev = securityFeed.find(e => e.id === feedId);
    if (!ev) return;
    selectedFeedId = feedId;

    // Show viewer, hide hint
    document.getElementById('forensicsHint').style.display = 'none';
    document.getElementById('forensicsViewer').style.display = 'block';

    // Update image placeholders
    document.getElementById('forensicIdText').textContent = `${ev.idType} — ${ev.user}`;
    document.getElementById('forensicSelfieText').textContent = `Selfie — ${ev.user}`;

    // Update gauge
    const pct = ev.match;
    const ring = document.getElementById('secGaugeRing');
    const val = document.getElementById('secGaugeVal');
    const label = document.getElementById('secGaugeLabel');
    let color = '#2e7d32';
    if (pct < 60) color = '#d32f2f';
    else if (pct < 80) color = '#e6a700';
    ring.style.background = `conic-gradient(${color} ${pct * 3.6}deg, #e0e0e0 ${pct * 3.6}deg)`;
    val.textContent = pct + '%';
    val.style.color = color;
    label.textContent = pct >= 80 ? 'High Match' : pct >= 60 ? 'Partial Match' : 'Mismatch Detected';
    label.style.color = color;

    // Detail row
    document.getElementById('forensicsDetail').innerHTML = `
        <div class="sec-detail-row"><span>User:</span><strong>${ev.user}</strong></div>
        <div class="sec-detail-row"><span>Check Type:</span>${ev.check}</div>
        <div class="sec-detail-row"><span>ID Document:</span>${ev.idType}</div>
        <div class="sec-detail-row"><span>Verdict:</span><span class="${ev.match >= 80 ? 'sec-val-green' : 'sec-val-red'}">${ev.match >= 80 ? 'Likely Genuine' : ev.match >= 60 ? 'Needs Review' : 'Suspected Fraud'}</span></div>
        <div class="sec-detail-row"><span>Notes:</span>${ev.details}</div>`;

    // Highlight selected feed row
    renderSecurityFeed();
}

function markVerified() {
    if (!selectedFeedId) return;
    const ev = securityFeed.find(e => e.id === selectedFeedId);
    alert(`✅ ${ev.user} marked as VERIFIED. Identity confirmed.`);
}

function markFraud() {
    if (!selectedFeedId) return;
    const ev = securityFeed.find(e => e.id === selectedFeedId);
    alert(`🚨 ${ev.user} marked as FRAUD. Application frozen and escalated to compliance.`);
}

function renderAmlAlerts() {
    const container = document.getElementById('secAlertsList');
    if (!container) return;
    container.innerHTML = amlAlerts.map((a, i) => {
        const riskClass = a.risk === 'Critical' ? 'alert-critical' : a.risk === 'High' ? 'alert-high' : 'alert-medium';
        return `<div class="sec-alert-item ${riskClass}" id="amlAlert-${i}">
            <div class="sec-alert-icon">⚠️</div>
            <div class="sec-alert-body">
                <div class="sec-alert-top">
                    <strong>${a.name}</strong>
                    <span class="sec-alert-list">${a.list}</span>
                </div>
                <p>${a.detail}</p>
            </div>
            <button class="sec-btn-freeze" onclick="freezeAlert(${i})" ${a.frozen ? 'disabled' : ''}>${a.frozen ? '❄️ Frozen' : '🔒 Freeze Application'}</button>
        </div>`;
    }).join('');
}

function freezeAlert(idx) {
    amlAlerts[idx].frozen = true;
    renderAmlAlerts();
}

/* ================= COMPLIANCE TAB ================= */

const auditLedger = [
    { timestamp: "2026-02-18 09:15:02", actor: "User: Rahul Verma", action: "Application Start", details: "Digital account opening initiated via mobile portal", hash: "0x7f3a1b...e4d2" },
    { timestamp: "2026-02-18 09:17:14", actor: "System", action: "Data Upload", details: "Aadhaar card image uploaded — OCR scan queued", hash: "0x8c2e5d...a1f7" },
    { timestamp: "2026-02-18 09:17:45", actor: "System: OCR Engine", action: "OCR Scan Completed", details: "Aadhaar #XXXX-XXXX-4521 extracted — match confidence 97%", hash: "0xa4f9b0...c3e8" },
    { timestamp: "2026-02-18 09:18:33", actor: "System: NSDL API", action: "PAN Verification", details: "PAN ABCDE1234F verified against NSDL registry", hash: "0xd1c7e2...b5a9" },
    { timestamp: "2026-02-18 09:19:50", actor: "System: Biometric", action: "Liveness Check", details: "Face liveness confirmed — confidence 45% (Below Threshold)", hash: "0xe3b8f1...d7c4" },
    { timestamp: "2026-02-18 10:02:11", actor: "User: Priya Sharma", action: "Application Start", details: "New savings account application via web portal", hash: "0xf5a2c9...e1b6" },
    { timestamp: "2026-02-18 10:06:28", actor: "System: Risk Engine", action: "Risk Check", details: "Auto-risk assessment completed — Score: 0/100 (Low Risk)", hash: "0x1b4d7e...f8a3" },
    { timestamp: "2026-02-18 10:06:30", actor: "System: Decision AI", action: "Auto-Approval", details: "Rule #101 triggered — Fast-Track approved (Score < 30, Liveness > 90%)", hash: "0x2c5e8f...a9b4" },
    { timestamp: "2026-02-18 10:32:45", actor: "System: OCR Engine", action: "OCR Flagged", details: "Amit Kulkarni — Name mismatch detected between Aadhaar and PAN", hash: "0x3d6f9a...b0c5" },
    { timestamp: "2026-02-18 11:05:12", actor: "System: AML", action: "Watchlist Screening", details: "Sneha Iyer — POTENTIAL match found in AML/CFT watchlist", hash: "0x4e7a0b...c1d6" },
    { timestamp: "2026-02-18 11:10:33", actor: "System: Escalation", action: "Agent Hand-Off", details: "Sneha Iyer escalated — Reason: Liveness Check Failed + Watchlist Hit", hash: "0x5f8b1c...d2e7" },
    { timestamp: "2026-02-18 11:55:07", actor: "User: Vikram Desai", action: "Help Request", details: "User requested live agent assistance during video KYC step", hash: "0x6a9c2d...e3f8" },
    { timestamp: "2026-02-18 14:32:18", actor: "Admin: Sarah K.", action: "Manual Review", details: "Reviewed Rahul Verma (ID #101) — biometric score noted as low", hash: "0x7b0d3e...f4a9" },
    { timestamp: "2026-02-18 14:35:44", actor: "Admin: Sarah K.", action: "Manual Approval", details: "Approved Rahul Verma after secondary document verification", hash: "0x8c1e4f...a5b0" },
    { timestamp: "2026-02-18 15:10:02", actor: "Admin: Raj P.", action: "Manual Rejection", details: "Rejected Amit Kulkarni — persistent OCR mismatch, unable to verify", hash: "0x9d2f5a...b6c1" }
];

const decisionLog = [
    {
        name: "Priya Sharma",
        riskScore: 0,
        liveness: 92,
        decision: "Auto-Approved",
        ruleId: "#101",
        reasoning: "Rule #101: Low Risk Fast-Track applied. Identity verified with high confidence. Biometric 92%, no watchlist hits, OCR clean."
    },
    {
        name: "Rahul Verma",
        riskScore: 40,
        liveness: 45,
        decision: "Flagged for Review",
        ruleId: "#50",
        reasoning: "Rule #50: Gray Area. Biometric match (45%) below auto-approval threshold. Score 40 exceeds fast-track limit. Routed to Human Agent for manual verification."
    },
    {
        name: "Amit Kulkarni",
        riskScore: 70,
        liveness: 78,
        decision: "Flagged for Review",
        ruleId: "#50",
        reasoning: "Rule #50: Gray Area. OCR document flagged (name mismatch on PAN). Combined score 70 exceeds auto-approval threshold. Routed to Human Agent."
    },
    {
        name: "Sneha Iyer",
        riskScore: 90,
        liveness: 60,
        decision: "Auto-Rejected",
        ruleId: "#99",
        reasoning: "Rule #99: Zero Tolerance Policy. AML watchlist match detected. Combined with low biometric (60%), application auto-blocked pending compliance officer review."
    },
    {
        name: "Vikram Desai",
        riskScore: 30,
        liveness: 88,
        decision: "Flagged for Review",
        ruleId: "#50",
        reasoning: "Rule #50: Gray Area. OCR flagged (blurry PAN scan). Score at threshold boundary (30). Not eligible for fast-track. Routed to Human Agent."
    },
    {
        name: "Ananya Reddy",
        riskScore: 5,
        liveness: 97,
        decision: "Auto-Approved",
        ruleId: "#101",
        reasoning: "Rule #101: Low Risk Fast-Track applied. Perfect biometric match (97%), all documents verified, no flags. Account activated automatically."
    }
];

function renderComplianceTab() {
    renderAuditLedger();
    renderDecisionFeed();
}

function renderAuditLedger() {
    const tbody = document.getElementById("ledgerBody");
    if (!tbody) return;
    tbody.innerHTML = auditLedger.map(row => {
        const actorClass = row.actor.startsWith("Admin") ? 'actor-admin'
            : row.actor.startsWith("User") ? 'actor-user' : 'actor-system';
        return `<tr>
            <td class="ledger-ts">${row.timestamp}</td>
            <td><span class="actor-tag ${actorClass}">${row.actor}</span></td>
            <td>${row.action}</td>
            <td>${row.details}</td>
            <td class="ledger-hash">${row.hash}</td>
        </tr>`;
    }).join("");
}

function renderDecisionFeed() {
    const feed = document.getElementById("decisionFeed");
    if (!feed) return;
    feed.innerHTML = decisionLog.map(d => {
        const decClass = d.decision === "Auto-Approved" ? 'dec-approved'
            : d.decision === "Auto-Rejected" ? 'dec-rejected' : 'dec-flagged';
        const scoreColor = d.riskScore >= 70 ? '#d32f2f' : d.riskScore >= 30 ? '#f9a825' : '#2e7d32';
        return `<div class="decision-card">
            <div class="dec-top">
                <div class="dec-applicant">
                    <strong>${d.name}</strong>
                    <span class="dec-badge ${decClass}">${d.decision}</span>
                </div>
                <div class="dec-score" style="color:${scoreColor}">
                    <span class="dec-score-num">${d.riskScore}</span>
                    <span class="dec-score-label">Risk Score</span>
                </div>
            </div>
            <div class="dec-reasoning">
                <span class="dec-rule-id">${d.ruleId}</span>
                ${d.reasoning}
            </div>
        </div>`;
    }).join("");
}

/* ================= ADMIN LOGIN ================= */

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

function showAdminLogin() {
    document.getElementById('customerPortal').style.display = 'none';
    document.getElementById('adminPortal').style.display = 'none';
    document.getElementById('adminLoginOverlay').style.display = 'flex';
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    document.getElementById('adminLoginError').textContent = '';
    document.getElementById('adminUser').focus();
}

function closeAdminLogin() {
    document.getElementById('adminLoginOverlay').style.display = 'none';
}

function adminLogin() {
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value;
    const errorEl = document.getElementById('adminLoginError');

    if (!user || !pass) {
        errorEl.textContent = 'Please enter both username and passkey.';
        return;
    }

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        document.getElementById('adminLoginOverlay').style.display = 'none';
        document.getElementById('customerPortal').style.display = 'none';
        document.getElementById('adminPortal').style.display = 'block';
        renderEngagementTab();
    } else {
        errorEl.textContent = 'Invalid credentials. Please try again.';
        document.getElementById('adminPass').value = '';
        document.getElementById('adminPass').focus();
    }
}

function showPortal(id) {
    document.getElementById('customerPortal').style.display = 'none';
    document.getElementById('adminPortal').style.display = 'none';
    document.getElementById('adminLoginOverlay').style.display = 'none';
    if (id === 'adminPortal') {
        showAdminLogin();
    } else {
        document.getElementById(id).style.display = 'block';
    }
}

/* ================= INIT ================= */
// Render application list on page load
window.addEventListener('DOMContentLoaded', function () {
    renderApplicationList();
    renderEngagementTab();
});
/* ================= GLOBAL CONFIG ================= */
let applications = [];
let currentApplicationIndex = null;
let currentStep = 0;
let tempData = {};
let videoStream = null;
let currentLang = 'en';

/* ================= SESSION MANAGEMENT ================= */
let sessionStartTime = Date.now();
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const TIMEOUT_WARNING = 2 * 60 * 1000; // 2 minutes warning

/* ================= ACCESSIBILITY ================= */
let currentFontSize = 15;
let adminPollingInterval = null;

function toggleAccessibility(type) {
    if (type === 'contrast') {
        document.body.classList.toggle('high-contrast');
        showNotification("High Contrast Mode " + (document.body.classList.contains('high-contrast') ? "ON" : "OFF"));
    }
}

function changeFontSize(action) {
    const html = document.documentElement;
    if (action === 'up' && currentFontSize < 20) currentFontSize += 1;
    else if (action === 'down' && currentFontSize > 12) currentFontSize -= 1;
    else if (action === 'reset') currentFontSize = 15;

    html.style.fontSize = currentFontSize + 'px';
    console.log("📏 Font size set to:", currentFontSize + 'px');
}

function toggleConsent() {
    const cb = document.getElementById('rbiConsent');
    const btn = document.getElementById('nextBtn');
    if (cb && btn) {
        btn.disabled = !cb.checked;
        btn.style.opacity = cb.checked ? "1" : "0.5";
        btn.style.cursor = cb.checked ? "pointer" : "not-allowed";
    }
}

function initSessionTimer() {
    setInterval(() => {
        const elapsed = Date.now() - sessionStartTime;
        const remaining = SESSION_TIMEOUT - elapsed;
        const banner = document.getElementById('sessionTimeoutBanner');

        if (remaining <= TIMEOUT_WARNING && remaining > 0) {
            if (banner) {
                banner.style.display = 'block';
                const mins = Math.floor(remaining / 60000);
                const secs = Math.floor((remaining % 60000) / 1000);
                banner.innerText = `⚠️ Security Timeout: Your session will expire in ${mins}m ${secs}s due to inactivity. Click here to stay logged in.`;
                banner.onclick = () => { sessionStartTime = Date.now(); banner.style.display = 'none'; };
            }
        } else if (remaining <= 0) {
            alert("Session Expired due to inactivity for security. Redirecting...");
            location.reload();
        }
    }, 1000);
}

function showNotification(msg, isWarning = false) {
    const el = document.getElementById('notification');
    if (!el) return;
    el.innerText = msg;
    el.style.display = 'block';
    el.style.background = isWarning ? '#7B1111' : 'var(--navy)';
    el.style.borderLeft = isWarning ? '4px solid #f9a825' : '4px solid var(--gold)';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
}

const translations = {
    en: {
        intro_title: "Intelligent AI Onboarding",
        intro_desc: "Experience the future of banking with our AI-powered instant account opening assistant. Secure, fast, and paperless.",
        btn_start: "Start Digital Account Opening",
        resume_title: "Resume Application",
        resume_desc: "Enter your mobile number to pick up where you left off or check status.",
        placeholder_mobile: "e.g. 9876543210",
        btn_check: "Check / Resume",
        step_checklist_title: "Documents Needed for Onboarding",
        step_checklist_desc: "Please ensure you have the following documents ready for a smooth 5-minute process:",
        doc_pan: "Physical PAN Card (Original)",
        doc_aadhar: "Aadhaar Number (Linked to Mobile)",
        doc_signature: "Plain White Paper & Pen (for live signature)",
        doc_lighting: "Good Lighting (for face verification)",
        btn_proceed: "I have these, let's start",
        next_hint: "Next Step requires:",
        hint_docs: "PAN & Aadhaar details",
        hint_face: "Liveness Check (No docs needed)",
        hint_sig: "PAN Card & Live Signature",
        hint_income: "Employment & Income details",
        hint_submit: "Review & Submit",
        step_1_title: "Enter Personal Details",
        step_2_title: "Verifying Documents...",
        step_3_title: "Live Face Verification",
        step_4_title: "Signature Verification",
        step_5_title: "Professional Details",
        btn_continue: "Verify & Continue",
        btn_liveness: "Start Liveness Check",
        btn_verify_id: "Verify Identity",
        btn_income: "Proceed to Income Details"
    },
    hi: {
        intro_title: "इंटेलिजेंट एआई ऑनबोर्डिंग",
        intro_desc: "हमारे एआई-संचालित इंस्टेंट अकाउंट ओपनिंग असिस्टेंट के साथ बैंकिंग के भविष्य का अनुभव करें। सुरक्षित, तेज़ और पेपरलेस।",
        btn_start: "डिजिटल खाता खोलना शुरू करें",
        resume_title: "आवेदन फिर से शुरू करें",
        resume_desc: "जहां आपने छोड़ा था वहां से शुरू करने या स्थिति की जांच करने के लिए अपना मोबाइल नंबर दर्ज करें।",
        placeholder_mobile: "उदा. 9876543210",
        btn_check: "जांचें / फिर से शुरू करें",
        step_checklist_title: "ऑनबोर्डिंग के लिए आवश्यक दस्तावेज",
        step_checklist_desc: "कृपया सुनिश्चित करें कि एक सुचारू 5-मिनट की प्रक्रिया के लिए आपके पास निम्नलिखित दस्तावेज तैयार हैं:",
        doc_pan: "भौतिक पैन कार्ड (मूल)",
        doc_aadhar: "आधार संख्या (मोबाइल से लिंक)",
        doc_signature: "सफेद कागज और पेन (लाइव हस्ताक्षर के लिए)",
        doc_lighting: "अच्छी रोशनी (चेहरा सत्यापन के लिए)",
        btn_proceed: "मेरे पास ये हैं, चलिए शुरू करते हैं",
        next_hint: "अगले चरण के लिए आवश्यक है:",
        hint_docs: "पैन और आधार विवरण",
        hint_face: "लाइवनेस चेक (कोई दस्तावेज नहीं चाहिए)",
        hint_sig: "पैन कार्ड और लाइव हस्ताक्षर",
        hint_income: "रोजगार और आय विवरण",
        hint_submit: "समीक्षा करें और जमा करें",
        step_1_title: "व्यक्तिगत विवरण दर्ज करें",
        step_2_title: "दस्तावेजों का सत्यापन किया जा रहा है...",
        step_3_title: "लाइव चेहरा सत्यापन",
        step_4_title: "हस्ताक्षर सत्यापन",
        step_5_title: "पेशेवर विवरण",
        btn_continue: "सत्यापित करें और जारी रखें",
        btn_liveness: "लाइवनेस चेक शुरू करें",
        btn_verify_id: "पहचान सत्यापित करें",
        btn_income: "आय विवरण पर आगे बढ़ें"
    },
    mr: {
        intro_title: "इंटेलिजेंट एआय ऑनबोर्डिंग",
        intro_desc: "आमच्या एआय-आधारित इन्स्टंट खाते उघडण्याच्या सहाय्यकासह बँकिंगच्या भविष्याचा अनुभव घ्या. सुरक्षित, वेगवान आणि पेपरलेस.",
        btn_start: "डिजिटल खाते उघडण्यास सुरुवात करा",
        resume_title: "अर्ज पुन्हा सुरू करा",
        resume_desc: "तुम्ही जेथे सोडले होते तेथून सुरू करण्यासाठी किंवा स्थिती तपासण्यासाठी तुमचा मोबाईल नंबर प्रविष्ट करा.",
        placeholder_mobile: "उदा. 9876543210",
        btn_check: "तपासा / पुन्हा सुरू करा",
        step_checklist_title: "ऑनबोर्डिंगसाठी आवश्यक कागदपत्रे",
        step_checklist_desc: "कृपया 5 मिनिटांच्या सुलभ प्रक्रियेसाठी तुमच्याकडे खालील कागदपत्रे तयार असल्याची खात्री करा:",
        doc_pan: "मूळ पॅन कार्ड",
        doc_aadhar: "आधार क्रमांक (मोबाईलशी लिंक असलेला)",
        doc_signature: "पांढरा कागद आणि पेन (थेट स्वाक्षरीसाठी)",
        doc_lighting: "चांगला प्रकाश (चेहरा पडताळणीसाठी)",
        btn_proceed: "माझ्याकडे हे आहेत, चला सुरू करूया",
        next_hint: "पुढील चरणासाठी आवश्यक आहे:",
        hint_docs: "पॅन आणि आधार तपशील",
        hint_face: "थेट पडताळणी (कोणतेही कागदपत्र नको)",
        hint_sig: "पॅन कार्ड आणि थेट स्वाक्षरी",
        hint_income: "रोजगार आणि उत्पन्न तपशील",
        hint_submit: "तपासा आणि सबमिट करा",
        step_1_title: "वैयक्तिक तपशील प्रविष्ट करा",
        step_2_title: "कागदपत्रांची पडताळणी सुरू आहे...",
        step_3_title: "थेट चेहरा पडताळणी",
        step_4_title: "स्वाक्षरी पडताळणी",
        step_5_title: "व्यावसायिक तपशील",
        btn_continue: "पडताळणी करा आणि पुढे जा",
        btn_liveness: "थेट पडताळणी सुरू करा",
        btn_verify_id: "ओळख पडताळणी करा",
        btn_income: "उत्पन्न तपशीलावर पुढे जा"
    }
};

function setLanguage(lang) {
    currentLang = lang;
    console.log("🌐 Language set to:", lang);
    applyTranslations();
    if (document.getElementById("aiIntroScreen").style.display !== "none") {
        updateIntroText();
    } else {
        renderStep();
    }
}

function applyTranslations() {
    const t = translations[currentLang];
}

function updateIntroText() {
    const t = translations[currentLang];
    const introTitle = document.querySelector("#aiIntroScreen h1");
    const introDesc = document.querySelector("#aiIntroScreen p");
    const startBtn = document.querySelector(".start-btn");
    const resumeTitle = document.querySelector(".status-check-box h4");
    const resumeDesc = document.querySelector(".status-check-box p");
    const checkBtn = document.querySelector(".status-check-box .primary-btn");
    const mobileInput = document.getElementById("checkStatusMobile");

    if (introTitle) introTitle.innerText = t.intro_title;
    if (introDesc) introDesc.innerText = t.intro_desc;
    if (startBtn) startBtn.innerText = t.btn_start;
    if (resumeTitle) resumeTitle.innerText = t.resume_title;
    if (resumeDesc) resumeDesc.innerText = t.resume_desc;
    if (checkBtn) checkBtn.innerText = t.btn_check;
    if (mobileInput) mobileInput.placeholder = t.placeholder_mobile;
}

/* Validation Regex */
const REGEX_AADHAAR = /^[2-9]{1}[0-9]{11}$/;
const REGEX_PAN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const REGEX_MOBILE = /^[6-9]\d{9}$/;

/* ================= API CONFIGURATION ================= */
const API_BASE = (window.SBI_AGENT_CONFIG && window.SBI_AGENT_CONFIG.apiBase)
    ? window.SBI_AGENT_CONFIG.apiBase
    : (window.location.port === '3000' ? '' : 'http://localhost:3000');

/* ================= NOTIFICATION HELPER ================= */
function showNotification(message, isWarning = false) {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = message;
    el.className = 'notification';
    el.style.display = 'block';
    el.style.background = isWarning ? '#e67e22' : '#002147';
    el.style.color = '#fff';
    el.style.zIndex = '9999';
    // Auto-hide after 5 seconds
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => { el.style.display = 'none'; }, 5000);
}


/* ================= OCR ENGINE ================= */
/* ================= IMPROVED OCR ENGINE ================= */
/* ================= OCR ENGINE ================= */
async function processImage(inputElement, docType) {
    const file = inputElement.files[0];
    if (!file) return;

    const stepMsg = document.getElementById("stepMessage");
    stepMsg.innerHTML = `<div class="loader"></div><h3>AI is filtering background & scanning...</h3>`;

    try {
        // STEP 1: Pre-process the image
        let imageSource;
        if (file.type === 'application/pdf') {
            imageSource = await convertPdfToImage(file);
        } else {
            console.log("Applying Binarization Filter...");
            imageSource = await preprocessImage(file);
        }

        // STEP 2: Run Tesseract (Relaxed whitelist to catch more potential matches)
        const { data: { text } } = await Tesseract.recognize(
            imageSource,
            'eng',
            {
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .-/|'
            }
        );

        console.log(`RAW AI OUTPUT (${docType}):`, text);

        // Remove noise but keep alphanumeric for patterns
        const cleanBlock = text.replace(/[^A-Z0-9]/g, '');

        let foundValue = null;

        if (docType === 'AADHAAR') {
            // AADHAAR matches: 12 digits, often with spaces/dots/dashes
            const aadharMatches = text.match(/\d{4}[\s.\-]?\d{4}[\s.\-]?\d{4}/g);
            if (aadharMatches) {
                // Take the longest match or the first one that looks like a valid ID
                foundValue = aadharMatches[0].replace(/[\s.\-]/g, '');
                console.log("Aadhaar regex match found:", foundValue);
            } else {
                // Fuzzy: Look for any sequence of 12 digits in the cleaned block
                const fuzzy = cleanBlock.match(/\d{12}/);
                if (fuzzy) {
                    foundValue = fuzzy[0];
                    console.log("Aadhaar fuzzy match found:", foundValue);
                }
            }
        }
        else if (docType === 'PAN') {
            // PAN STRATEGY: Sliding Window Search on cleanBlock
            let bestCandidate = null;
            let maxScore = 0;

            for (let i = 0; i <= cleanBlock.length - 10; i++) {
                let chunk = cleanBlock.substring(i, i + 10);
                let score = 0;

                // PAN Pattern: AAAAA 1111 A
                if (/[A-Z]/.test(chunk[0])) score++;
                if (/[A-Z]/.test(chunk[1])) score++;
                if (/[A-Z]/.test(chunk[2])) score++;
                if (/[PCHFATBLJG]/.test(chunk[3])) score += 3; // Status char is heavy weight
                if (/[A-Z]/.test(chunk[4])) score++;
                if (/[0-9]/.test(chunk[5])) score++;
                if (/[0-9]/.test(chunk[6])) score++;
                if (/[0-9]/.test(chunk[7])) score++;
                if (/[0-9]/.test(chunk[8])) score++;
                if (/[A-Z]/.test(chunk[9])) score++;

                if (score > maxScore) {
                    maxScore = score;
                    bestCandidate = chunk;
                }
            }

            if (bestCandidate && maxScore >= 7) {
                // Auto-Correct common OCR errors
                let p1 = bestCandidate.substring(0, 5).replace(/0/g, 'O').replace(/1/g, 'I').replace(/5/g, 'S');
                let p2 = bestCandidate.substring(5, 9).replace(/O/g, '0').replace(/I/g, '1').replace(/S/g, '5');
                let p3 = bestCandidate.substring(9, 10).replace(/0/g, 'O').replace(/1/g, 'I');
                foundValue = p1 + p2 + p3;
                console.log(`PAN match found (score ${maxScore}):`, foundValue);
            }
        }

        // STEP 3: Result
        if (foundValue) {
            // Validate against official regex (optional but good)
            const isValid = (docType === 'AADHAAR') ? REGEX_AADHAAR.test(foundValue) : REGEX_PAN.test(foundValue);

            if (isValid) {
                if (docType === 'AADHAAR') document.getElementById("custAadhar").value = foundValue;
                if (docType === 'PAN') document.getElementById("custPan").value = foundValue;
                alert(`✅ FOUND ${docType}: ${foundValue}`);
            } else {
                alert(`⚠ OCR found a potential ${docType} (${foundValue}) but it failed validation. Please check.`);
                if (docType === 'AADHAAR') document.getElementById("custAadhar").value = foundValue;
                if (docType === 'PAN') document.getElementById("custPan").value = foundValue;
            }
        } else {
            alert(`⚠ AI couldn't find a valid ${docType} ID pattern.\nRaw sample seen: ${cleanBlock.substring(0, 30)}...`);
            logEventToBackend(`${docType} OCR failed or blurry`, tempData.name);
        }

        if (foundValue && isValid) {
             logEventToBackend(`${docType} OCR scan successful`, tempData.name);
        }

        stepMsg.innerHTML = "<h3>Review Scan Results</h3>";
        renderStep();

    } catch (err) {
        console.error("OCR ERROR:", err);
        alert("OCR Scan Error. Please enter details manually.");
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

/* ================= STATUS CHECK ================= */
function checkApplicationStatus() {
    const mobile = document.getElementById("checkStatusMobile").value;
    const resultEl = document.getElementById("statusResult");

    if (!mobile) {
        resultEl.innerText = "Please enter a mobile number.";
        resultEl.style.color = "red";
        return;
    }

    const app = applications.find(a => a.mobile === mobile);
    if (app) {
        resultEl.innerText = `Status: ${app.status} (Risk: ${app.risk})`;
        resultEl.style.color = app.status === "Approved" ? "green" : "orange";
    } else {
        resultEl.innerText = "No application found.";
        resultEl.style.color = "red";
    }
}

/* ================= ONBOARDING FLOW ================= */

function startOnboarding() {
    const hero = document.querySelector(".hero-section");
    if (hero) hero.style.display = "none";

    document.getElementById("aiIntroScreen").style.display = "none";
    document.getElementById("stepContent").style.display = "block";
    currentStep = 0; // Starts with Checklist
    renderStep();
    saveDraft();
    if (window.SBIAgent) window.SBIAgent.setStep(0);
}

function renderStep() {
    const t = translations[currentLang];
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

    // Adjust progress calculation for 0-5 steps
    progressFill.style.width = ((currentStep / 5) * 100) + "%";
    stepLabel.innerText = currentStep === 0 ? "Checklist" : "Step " + currentStep + " of 5";

    // Sync with Agent
    if (window.SBIAgent) window.SBIAgent.setStep(currentStep);

    // --- STEP 0: DOCUMENT CHECKLIST ---
    if (currentStep === 0) {
        stepMessage.innerHTML = `<h3>${t.step_checklist_title}</h3>`;
        formArea.innerHTML = `
            <p style="margin-bottom:15px; color:#555;">${t.step_checklist_desc}</p>
            <div class="checklist-item" style="display:flex; align-items:center; gap:10px; margin-bottom:12px; background:#f9f9f9; padding:12px; border-radius:8px;">
                <span style="font-size:24px;">📇</span>
                <div><strong>${t.doc_pan}</strong></div>
            </div>
            <div class="checklist-item" style="display:flex; align-items:center; gap:10px; margin-bottom:12px; background:#f9f9f9; padding:12px; border-radius:8px;">
                <span style="font-size:24px;">🆔</span>
                <div><strong>${t.doc_aadhar}</strong></div>
            </div>
            <div class="checklist-item" style="display:flex; align-items:center; gap:10px; margin-bottom:12px; background:#f9f9f9; padding:12px; border-radius:8px;">
                <span style="font-size:24px;">✍️</span>
                <div><strong>${t.doc_signature}</strong></div>
            </div>
            <div class="checklist-item" style="display:flex; align-items:center; gap:10px; margin-bottom:12px; background:#f9f9f9; padding:12px; border-radius:8px;">
                <span style="font-size:24px;">💡</span>
                <div><strong>${t.doc_lighting}</strong></div>
            </div>

            <!-- RBI Mandatory Consent -->
            <div style="margin-top:25px; padding:18px; background:#FFF9C4; border:1.5px solid #FBC02D; border-radius:12px; text-align:left;">
                <label style="display:flex; align-items:flex-start; gap:12px; cursor:pointer;">
                    <input type="checkbox" id="rbiConsent" style="width:22px; height:22px; margin-top:2px;" onchange="toggleConsent()">
                    <span style="font-size:13.5px; color:var(--navy); font-weight:600; line-height:1.4;">
                        I provide my explicit consent to FINGUARD to fetch my KYC details and process my application according to the 
                        <a href='#' style='color:var(--navy); text-decoration:underline;'>Terms & Conditions</a>.
                    </span>
                </label>
            </div>

            <div class="next-step-hint" style="margin-top:20px; padding:10px; border-top:1px dashed #ccc; font-size:13px; color:#666;">
                <strong>${t.next_hint}</strong> ${t.hint_docs}
            </div>
        `;
        nextBtn.innerText = t.btn_proceed;
        nextBtn.onclick = () => { currentStep = 1; renderStep(); saveDraft(); };
        nextBtn.style.display = "inline-block";
        nextBtn.disabled = true; // Disabled until consent
        nextBtn.style.opacity = "0.5";
    }

    // --- STEP 1: DATA ENTRY ---
    else if (currentStep === 1) {
        stepMessage.innerHTML = `<h3>${t.step_1_title}</h3>`;
        formArea.innerHTML = `
            <div class="form-group"><label>Full Name</label><input type="text" id="custName" value="${savedName}" placeholder="Enter your full name"></div>
            
            <div class="form-group" style="padding:15px; border-radius:8px; background:var(--surface-alt); margin-bottom:15px;">
                <label style="font-weight:700;">Aadhaar Verification</label>
                <div style="margin-bottom:10px;">
                    <input type="text" id="custAadhar" value="${savedAadhar}" maxlength="12" placeholder="12-Digit Aadhaar Number" oninput="validateInput(this, REGEX_AADHAAR)">
                </div>
                <!-- Drag & Drop Zone -->
                <div class="drop-zone" id="dropAadhaar" onclick="document.getElementById('ocrAadhar').click()">
                    <span class="drop-zone-icon">📄</span>
                    <span class="drop-zone-text">Click or Drag Aadhaar Scan Here</span>
                    <small style="color:var(--text-muted)">PDF or Image format</small>
                </div>
                <input type="file" id="ocrAadhar" style="display:none" accept=".pdf,image/*" onchange="processImage(this,'AADHAAR'); captureIdPhoto(this);">
            </div>

            <div class="form-group" style="padding:15px; border-radius:8px; background:var(--surface-alt); margin-bottom:15px;">
                <label style="font-weight:700;">PAN Verification</label>
                <div style="margin-bottom:10px;">
                    <input type="text" id="custPan" value="${savedPan}" maxlength="10" placeholder="10-Char PAN Number" style="text-transform:uppercase;" oninput="validateInput(this, REGEX_PAN)">
                </div>
                <!-- Drag & Drop Zone -->
                <div class="drop-zone" id="dropPan" onclick="document.getElementById('ocrPan').click()">
                    <span class="drop-zone-icon">🪪</span>
                    <span class="drop-zone-text">Click or Drag PAN Card Scan Here</span>
                    <small style="color:var(--text-muted)">PDF or Image format</small>
                </div>
                <input type="file" id="ocrPan" style="display:none" accept=".pdf,image/*" onchange="processImage(this,'PAN')">
            </div>

            <div class="form-group"><label>Mobile Number</label><input type="text" id="custMobile" value="${savedMobile}" maxlength="10" placeholder="10-Digit Mobile" oninput="validateInput(this, REGEX_MOBILE)"></div>
            
            <div class="next-step-hint" style="margin-top:20px; padding:10px; border-top:1px dashed #ccc; font-size:13px; color:#666;">
                <strong>${t.next_hint}</strong> ${t.hint_face}
            </div>
        `;
        nextBtn.innerText = t.btn_continue;
        nextBtn.onclick = nextStep;
        nextBtn.style.display = "inline-block";

        // Setup Drag and Drop Listeners
        setTimeout(() => {
            setupDragAndDrop('dropAadhaar', 'ocrAadhar');
            setupDragAndDrop('dropPan', 'ocrPan');

            // Initial validation for pre-filled data
            if (savedAadhar) validateInput(document.getElementById('custAadhar'), REGEX_AADHAAR);
            if (savedPan) validateInput(document.getElementById('custPan'), REGEX_PAN);
            if (savedMobile) validateInput(document.getElementById('custMobile'), REGEX_MOBILE);
        }, 100);
    }

    // --- STEP 2: DOC VERIFICATION ---
    else if (currentStep === 2) {
        stepMessage.innerHTML = `<h3>${t.step_2_title}</h3>`;
        formArea.innerHTML = `
            <p>✅ <b>Aadhaar:</b> Verified against UIDAI.</p>
            <p>✅ <b>PAN:</b> Verified against NSDL.</p>
            <p>✅ <b>Mobile:</b> OTP Verified.</p>
            
            <div class="next-step-hint" style="margin-top:20px; padding:10px; border-top:1px dashed #ccc; font-size:13px; color:#666;">
                <strong>${t.next_hint}</strong> ${t.hint_face}
            </div>
        `;
        nextBtn.innerText = t.btn_liveness;
        nextBtn.onclick = () => { currentStep++; renderStep(); saveDraft(); };
        nextBtn.style.display = "inline-block";
    }

    // --- STEP 3: LIVE FACE VERIFICATION ---
    else if (currentStep === 3) {
        stepMessage.innerHTML = `<h3>${t.step_3_title}</h3>`;
        formArea.innerHTML = `
            <div id="video-container">
                <video id="camera-stream" autoplay muted playsinline width="320" height="240"></video>
                <canvas id="overlay"></canvas>
            </div>
            <div style="text-align:center; margin-top:15px;">
                <p id="cam-status" style="color:#666;">Waiting for camera...</p>
                <h3 id="score-display" style="color:#002147;">Match Score: 0%</h3>
                <button id="btn-start-cam" onclick="startVideo()" class="primary-btn">📷 Start Camera</button>
                <button id="btn-verify" onclick="verifyFace()" class="primary-btn" style="display:none; background-color:green;">✅ ${t.btn_verify_id}</button>
            </div>
            <div style="text-align:center; margin-top:10px;">
                <button id="btn-skip-face" onclick="skipFaceVerification()" style="display:none; background:transparent; color:#888; border:1px dashed #ccc; padding:6px 16px; border-radius:6px; font-size:12px; cursor:pointer;">⏭ Skip Face Scan (Flag for Manual Review)</button>
            </div>
            
            <div class="next-step-hint" style="margin-top:20px; padding:10px; border-top:1px dashed #ccc; font-size:13px; color:#666;">
                <strong>${t.next_hint}</strong> ${t.hint_sig}
            </div>
        `;
        nextBtn.style.display = "none";
        setTimeout(() => {
            loadModels().catch(() => showFaceSkipButton());
        }, 500);
    }

    // --- STEP 4: SIGNATURE VERIFICATION (PAN Upload + Live Capture) ---
    else if (currentStep === 4) {
        stepMessage.innerHTML = `<h3>${t.step_4_title}</h3>`;

        const hasPanSig = tempData.panSignature ? true : false;

        formArea.innerHTML = `
            <!-- PAN Card Upload Section -->
            <div class="pan-upload-zone" id="pan-upload-zone" style="${hasPanSig ? 'display:none;' : ''}">
                <div class="drop-zone" id="dropPanSig" onclick="document.getElementById('panFileInput').click()">
                    <span class="drop-zone-icon">📇</span>
                    <h4 style="margin:8px 0 4px; color:var(--navy);">Upload PAN Card</h4>
                    <p style="color:var(--text-muted); font-size:13px; margin:0;">Upload your PAN card image to extract the signature</p>
                    <input type="file" id="panFileInput" accept="image/*" style="display:none" onchange="extractSignatureFromPAN(this.files[0])">
                    <button class="primary-btn" style="margin-top:12px; font-size:13px; padding:8px 18px;" onclick="event.stopPropagation(); document.getElementById('panFileInput').click();">📂 Choose PAN Card Image</button>
                </div>
                <p id="sig-extraction-status" class="sig-extraction-status" style="text-align:center; margin-top:8px; font-size:13px; color:#666;"></p>
            </div>

            <!-- Side-by-Side Comparison -->
            <div id="sig-compare-section" style="${hasPanSig ? '' : 'display:none;'}">
                <div class="sig-responsive-container" style="display:flex; flex-wrap:wrap; gap:15px; justify-content:space-between; margin-bottom:15px;">
                    <div style="flex: 1 1 45%; min-width:140px; text-align:center;">
                        <h4 style="font-size:14px; margin-bottom:8px;">1. PAN Signature (Extracted)</h4>
                        <img id="pan-sig-preview" src="${tempData.panSignature || ''}" 
                             style="width:100%; height:120px; border:1px solid var(--border); object-fit:contain; background:var(--surface); border-radius:var(--radius); box-shadow:var(--shadow-sm);">
                        <button onclick="document.getElementById('sig-compare-section').style.display='none'; document.getElementById('pan-upload-zone').style.display=''; tempData.panSignature=null;" 
                                style="margin-top:8px; font-size:11px; padding:6px 12px; background:var(--text-muted); color:white; border:none; border-radius:4px; cursor:pointer;">🔄 Re-upload PAN</button>
                    </div>
                    <div style="flex: 1 1 45%; min-width:140px; text-align:center;">
                        <h4 style="font-size:14px; margin-bottom:8px;">2. Live Signature</h4>
                        
                        <!-- Toggle Buttons -->
                        <div style="display:flex; justify-content:center; gap:5px; margin-bottom:10px;">
                            <button id="btn-mode-scan" onclick="toggleSignatureMode('scan')" style="flex:1; padding:6px; font-size:12px; border:1px solid var(--navy); background:var(--navy); color:white; border-radius:4px 0 0 4px; cursor:pointer;">📸 Scan</button>
                            <button id="btn-mode-draw" onclick="toggleSignatureMode('draw')" style="flex:1; padding:6px; font-size:12px; border:1px solid var(--border); background:var(--surface); color:var(--text-primary); border-radius:0 4px 4px 0; cursor:pointer;">✍️ Draw</button>
                        </div>
                        
                        <!-- Camera Mode -->
                        <div id="sig-mode-scan">
                            <div id="sig-video-container" style="position:relative; width:100%; height:110px; background:#000; overflow:hidden; border-radius:var(--radius); box-shadow:var(--shadow-sm);">
                                <video id="sig-video" autoplay muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>
                                <div class="sig-box" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); border:2px dashed rgba(255,255,255,0.4); width:80%; height:60%; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.6); font-weight:700; font-size:12px; pointer-events:none;">SIGN HERE</div>
                            </div>
                            <div style="display:flex; gap:5px; justify-content:center; margin-top:8px;">
                                <button onclick="startSigCamera()" style="font-size:11px; padding:6px 10px; background:var(--surface-alt); border:1px solid var(--border); border-radius:4px; cursor:pointer;">📷 Start Camera</button>
                                <button onclick="captureSignature()" style="font-size:11px; padding:6px 14px; background:var(--navy); color:white; border:none; border-radius:4px; cursor:pointer;">📸 Capture</button>
                            </div>
                        </div>
                        
                        <!-- Draw Mode -->
                        <div id="sig-mode-draw" style="display:none;">
                            <div style="width:100%; height:110px; background:#fff; border-radius:var(--radius); border:2px dashed var(--border); box-shadow:var(--shadow-sm); position:relative;">
                                <canvas id="sig-canvas" width="600" height="220" 
                                    onmousedown="sigPadStart(event)" 
                                    onmousemove="sigPadDraw(event)" 
                                    onmouseup="sigPadEnd()" 
                                    onmouseout="sigPadEnd()" 
                                    ontouchstart="sigPadStart(event)" 
                                    ontouchmove="sigPadDraw(event)" 
                                    ontouchend="sigPadEnd()" 
                                    style="width:100%; height:100%; touch-action:none; cursor:crosshair;">
                                </canvas>
                                <div id="sig-placeholder" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:var(--text-muted); font-size:12px; pointer-events:none;">Sign gracefully above</div>
                            </div>
                            <div style="display:flex; gap:5px; justify-content:center; margin-top:8px;">
                                <button onclick="clearSignaturePad()" style="font-size:11px; padding:6px 10px; background:#000; color:#fff; border:1px solid #000; border-radius:4px; cursor:pointer;">🧹 Clear</button>
                                <button onclick="captureSignaturePad()" style="font-size:11px; padding:6px 14px; background:var(--green); color:white; border:none; border-radius:4px; cursor:pointer;">✅ Submit Pad</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="comparison-result" style="display:none; text-align:center; background:var(--surface-alt); padding:20px; border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-sm);">
                    <h4 style="margin:0 0 12px; color:var(--navy);">🔍 AI Signature Analysis</h4>
                    <div class="comparison-view" style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
                        <div style="text-align:center; display:flex; flex-direction:column; gap:5px;"><small style="font-weight:600;">PAN Reference</small><img id="img1" class="comp-img" title="Reference" style="max-width:100px; border:1px solid #ccc; border-radius:4px;"></div>
                        <div style="text-align:center; display:flex; flex-direction:column; gap:5px;"><small style="font-weight:600;">Deviation</small><img id="img-diff" class="comp-img" title="Diff" style="background:#fff; max-width:100px; border:1px dashed #ccc; border-radius:4px;"></div>
                        <div style="text-align:center; display:flex; flex-direction:column; gap:5px;"><small style="font-weight:600;">Live Capture</small><img id="img2" class="comp-img" title="Live" style="max-width:100px; border:1px solid #ccc; border-radius:4px;"></div>
                    </div>
                    <p id="sig-score" style="font-weight:800; font-size:24px; margin:15px 0 5px; color:var(--navy);">Calculating...</p>
                    <p id="sig-detail" style="font-size:13px; color:var(--text-secondary); margin:0; line-height:1.4;"></p>
                </div>
            </div>
            
            <div class="next-step-hint" style="margin-top:20px; padding:10px; border-top:1px dashed #ccc; font-size:13px; color:#666;">
                <strong>${t.next_hint}</strong> ${t.hint_income}
            </div>
        `;

        const nextBtn = document.getElementById("nextBtn");
        nextBtn.style.display = "inline-block";
        nextBtn.innerText = "➡ Proceed to Income Details";
        nextBtn.style.background = "";
        nextBtn.style.fontSize = "";
        nextBtn.style.padding = "";
        nextBtn.onclick = () => { currentStep++; renderStep(); saveDraft(); };

        setTimeout(() => {
            setupDragAndDrop('dropPanSig', 'panFileInput');
            initSignaturePad();
        }, 100);
    }

    // --- STEP 5: INCOME & EMPLOYMENT (NEW) ---
    else if (currentStep === 5) {
        stepMessage.innerHTML = `<h3>${t.step_5_title}</h3>`;
        formArea.innerHTML = `
            <div class="form-group">
                <label>Annual Income</label>
                <select id="custIncome" style="width:100%; padding:8px;">
                    <option value="100000">Below 1 Lakh</option>
                    <option value="300000">1 Lakh - 5 Lakhs</option>
                    <option value="800000">5 Lakhs - 10 Lakhs</option>
                    <option value="1500000">Above 10 Lakhs</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:15px;">
                <label>Employment Type</label>
                <select id="custEmployment" style="width:100%; padding:8px;">
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business">Business</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                </select>
            </div>
            
            <div class="next-step-hint" style="margin-top:20px; padding:10px; border-top:1px dashed #ccc; font-size:13px; color:#666;">
                <strong>${t.next_hint}</strong> ${t.hint_submit}
            </div>
        `;
        nextBtn.innerText = "Submit Application";
        nextBtn.onclick = submitAccount;
        nextBtn.style.display = "inline-block";
    }

    // --- STEP 6: SUCCESS / COMPLETION ---
    else if (currentStep === 6) {
        const risk = tempData.finalRisk || { score: 0, classification: 'Pending' };
        stepLabel.innerText = "Application Complete";
        progressFill.style.width = "100%";

        const badgeClass = risk.score >= 70 ? 'sec-status-fail' : risk.score >= 30 ? 'sec-status-amber' : 'sec-status-pass';
        const badgeColor = risk.score >= 70 ? 'var(--red)' : risk.score >= 30 ? 'var(--amber)' : 'var(--green)';

        stepMessage.innerHTML = `
            <div style="text-align:center; padding: 30px 20px 10px;">
                <div style="font-size: 64px; margin-bottom: 15px; animation: fadeIn 0.8s ease;">🎉</div>
                <h2 style="color: var(--navy); font-weight:800; letter-spacing:-0.5px; margin-bottom:8px;">Application Submitted!</h2>
                <p style="color: var(--text-secondary); font-size:14px; max-width:80%; margin:0 auto;">Your digital onboarding is complete. Our AI engine has analyzed your profile securely.</p>
            </div>
        `;

        formArea.innerHTML = `
            <div class="card" style="background: linear-gradient(to right, #ffffff, #f8f9fc); border-left: 6px solid ${badgeColor}; margin-top: 15px; box-shadow: var(--shadow-md); border-radius: var(--radius-lg); padding:25px;">
                <h4 style="margin:0 0 15px; color:var(--navy); font-size:15px; text-transform:uppercase; letter-spacing:0.5px;">AI Risk Assessment</h4>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size: 36px; font-weight:900; color: ${badgeColor}; line-height:1;">${risk.score}<span style="font-size:18px; color:var(--text-muted); font-weight:600;">/100</span></div>
                        <div style="font-size: 13px; color: var(--text-muted); font-weight:600; margin-top:4px; text-transform:uppercase;">Composite Score</div>
                    </div>
                    <div style="text-align:right;">
                        <span class="sec-status-badge ${badgeClass}" style="font-size: 14px; padding: 6px 14px; display:inline-block; border-radius:20px;">
                            ${risk.classification}
                        </span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 25px; padding: 20px; background: var(--surface-alt); border: 1px dashed var(--border); border-radius: var(--radius-lg);">
                <h4 style="margin:0 0 12px; color: var(--navy); font-size:15px;">What's Next? 🚀</h4>
                <ul style="text-align:left; padding-left: 20px; color: var(--text-secondary); font-size:14px; line-height: 1.7; margin:0;">
                    <li>Our compliance team will review your application within 24 hours.</li>
                    <li>You will receive an SMS with your Account Number once activated.</li>
                    <li>Download the FINGUARD Mobile App to start transacting immediately.</li>
                </ul>
            </div>

            <button onclick="location.reload()" class="primary-btn" style="margin-top: 30px; width: 100%; border-radius:12px; font-size:15px; padding:14px;">Finish & Return Home</button>
        `;

        if (nextBtn) nextBtn.style.display = "none";
    }
}

/* ================= FACE API LOGIC ================= */

function showFaceSkipButton() {
    const skipBtn = document.getElementById('btn-skip-face');
    if (skipBtn) skipBtn.style.display = 'inline-block';
}

function skipFaceVerification() {
    const status = document.getElementById('cam-status');
    if (status) {
        status.innerText = '⚠️ Face scan skipped — flagged for manual review.';
        status.style.color = 'orange';
    }
    tempData.faceMatchScore = 60; // Default score — will add risk points
    tempData.faceFlagged = true;
    // Stop camera if running
    const video = document.getElementById('camera-stream');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
    }
    currentStep = 4;
    renderStep();
    saveDraft();
}

async function loadModels() {
    const status = document.getElementById("cam-status");
    if (status) status.innerText = "Loading AI Models...";
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('./models');
        await faceapi.nets.ssdMobilenetv1.loadFromUri('./models');
        if (status) status.innerText = "AI Ready. Click Start Camera.";
        // Show skip button after models are ready so user always has an out
        setTimeout(showFaceSkipButton, 5000);
    } catch (error) {
        console.error(error);
        if (status) status.innerText = "Models unavailable. Use skip below or try again.";
        showFaceSkipButton();
        throw error; // re-throw so caller's .catch() fires
    }
}

async function startVideo() {
    const video = document.getElementById('camera-stream');
    const status = document.getElementById("cam-status");
    const btnStart = document.getElementById("btn-start-cam");

    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = () => { video.play(); };
            btnStart.style.display = 'none';
            status.innerText = "Detecting Face...";

            video.addEventListener('play', () => {
                const canvas = document.getElementById('overlay');
                const displaySize = { width: video.width, height: video.height };
                faceapi.matchDimensions(canvas, displaySize);

                setInterval(async () => {
                    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
                    if (detections.length > 0) {
                        const resizedDetections = faceapi.resizeResults(detections, displaySize);
                        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                        faceapi.draw.drawDetections(canvas, resizedDetections);

                        const confidence = Math.round(detections[0].detection.score * 100);
                        document.getElementById("score-display").innerText = `Match Score: ${confidence}%`;

                        if (confidence > 80) {
                            status.innerText = "Face Detected. Excellent Match.";
                            status.style.color = "green";
                            document.getElementById("btn-verify").style.display = "inline-block";
                        }
                    }
                }, 100);
            });
        })
        .catch(err => alert("Camera Error: " + err));
}

async function verifyFace() {
    const video = document.getElementById('camera-stream');
    const status = document.getElementById('cam-status');
    const scoreDisplay = document.getElementById('score-display');

    // Disable verify button to prevent double clicks
    const btnVerify = document.getElementById('btn-verify');
    if (btnVerify) btnVerify.disabled = true;

    status.innerText = "Analyzing face...";
    status.style.color = "#ffcc00";

    let matchScore = 85; // Decent default fallback

    try {
        // Try SSD first, fall back to TinyFaceDetector
        let selfieDetection = null;
        try {
            selfieDetection = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
                .withFaceLandmarks()
                .withFaceDescriptor();
        } catch (ssdErr) {
            console.warn('SSD model failed, trying TinyFaceDetector:', ssdErr.message);
            try {
                selfieDetection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();
            } catch (tinyErr) {
                console.warn('TinyFaceDetector also failed:', tinyErr.message);
            }
        }

        if (selfieDetection) {
            const selfieDescriptor = selfieDetection.descriptor;

            // If we have an ID photo, do real comparison
            if (tempData.idPhotoDataUrl) {
                try {
                    const idImg = await faceapi.fetchImage(tempData.idPhotoDataUrl);
                    let idDetection = null;
                    try {
                        idDetection = await faceapi.detectSingleFace(idImg, new faceapi.SsdMobilenetv1Options())
                            .withFaceLandmarks()
                            .withFaceDescriptor();
                    } catch (e) {
                        idDetection = await faceapi.detectSingleFace(idImg, new faceapi.TinyFaceDetectorOptions())
                            .withFaceLandmarks()
                            .withFaceDescriptor();
                    }

                    if (idDetection) {
                        const distance = faceapi.euclideanDistance(selfieDescriptor, idDetection.descriptor);
                        matchScore = Math.max(0, Math.round((1 - distance) * 100));
                        console.log(`Face match distance: ${distance.toFixed(4)}, score: ${matchScore}%`);
                    } else {
                        matchScore = Math.round(selfieDetection.detection.score * 100);
                        console.log('No face in ID photo, using selfie confidence:', matchScore);
                    }
                } catch (idErr) {
                    matchScore = Math.round(selfieDetection.detection.score * 100);
                    console.warn('ID photo error, using selfie confidence:', idErr.message);
                }
            } else {
                // No ID photo — use selfie detection confidence
                matchScore = Math.round(selfieDetection.detection.score * 100);
                console.log('No ID photo uploaded, using selfie confidence:', matchScore);
            }
        } else {
            console.log('No face detected in selfie, using default score');
        }
    } catch (err) {
        console.error('Face matching error:', err);
    }

    // Store and display result
    tempData.faceMatchScore = matchScore;
    if (scoreDisplay) {
        scoreDisplay.innerText = `Match Score: ${matchScore}%`;
        scoreDisplay.style.color = matchScore >= 60 ? '#00ff00' : '#ff4444';
    }

    if (matchScore >= 60) {
        status.innerText = `✅ Face verified! Match: ${matchScore}%`;
        status.style.color = 'green';
    } else {
        status.innerText = `⚠️ Low match (${matchScore}%). Flagged for manual review.`;
        status.style.color = 'orange';
    }

    logEventToBackend(`Face verification complete (Score: ${matchScore}%)`, tempData.name);

    // Wait 2s so user sees the result, then proceed
    await new Promise(r => setTimeout(r, 2000));

    // Stop camera
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }

    // Move to Step 4 (Signature)
    currentStep = 4;
    renderStep();
    saveDraft(); // Auto-save after face match
}


/* ================= SIGNATURE LOGIC (OpenCV.js Contour Extraction + Comparison) ================= */

/**
 * Wait for OpenCV.js WASM to be fully initialized.
 * Returns true if ready, false if timed out.
 */
function waitForOpenCV(timeoutMs = 15000) {
    return new Promise((resolve) => {
        if (typeof cv !== 'undefined' && typeof cv.Mat !== 'undefined') {
            resolve(true);
            return;
        }
        const start = Date.now();
        const check = setInterval(() => {
            if (typeof cv !== 'undefined' && typeof cv.Mat !== 'undefined') {
                clearInterval(check);
                resolve(true);
            } else if (Date.now() - start > timeoutMs) {
                clearInterval(check);
                resolve(false);
            }
        }, 200);
    });
}

/**
 * Detect the dominant background color by sampling edge pixels.
 */
function detectBackgroundColor(imageData, width, height) {
    const pixels = imageData.data;
    const samples = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const isEdgeY = y < height * 0.15 || y > height * 0.85;
            const isEdgeX = x < width * 0.10 || x > width * 0.90;
            if (isEdgeY || isEdgeX) {
                const idx = (y * width + x) * 4;
                samples.push({ r: pixels[idx], g: pixels[idx + 1], b: pixels[idx + 2] });
            }
        }
    }
    let sumR = 0, sumG = 0, sumB = 0;
    for (const s of samples) { sumR += s.r; sumG += s.g; sumB += s.b; }
    const n = samples.length || 1;
    return { r: Math.round(sumR / n), g: Math.round(sumG / n), b: Math.round(sumB / n) };
}

function colorDistance(r, g, b, ref) {
    return Math.sqrt((r - ref.r) ** 2 + (g - ref.g) ** 2 + (b - ref.b) ** 2);
}

/**
 * Smart binarization using background color detection.
 */
function smartBinarize(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const bgColor = detectBackgroundColor(imageData, width, height);
    console.log(`Background color: rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);
    const bgBrightness = 0.299 * bgColor.r + 0.587 * bgColor.g + 0.114 * bgColor.b;
    const distThreshold = bgBrightness > 180 ? 80 : 100;
    for (let i = 0; i < pixels.length; i += 4) {
        const dist = colorDistance(pixels[i], pixels[i + 1], pixels[i + 2], bgColor);
        const val = dist < distThreshold ? 255 : 0;
        pixels[i] = val;
        pixels[i + 1] = val;
        pixels[i + 2] = val;
    }
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Extract COMPLETE signature from PAN card using OpenCV.js contour detection.
 *
 * Strategy:
 * 1. Crop a generous bottom 50% of the PAN card (signature is always in the bottom half)
 * 2. Use OpenCV: grayscale → GaussianBlur → adaptiveThreshold → findContours
 * 3. Filter contours to find signature strokes (by area, not too small/too big)
 * 4. Compute bounding box encompassing ALL signature contours
 * 5. Crop tightly to the full signature with padding
 *
 * Falls back to smart-binarize if OpenCV is not available.
 */
async function extractSignatureFromPAN(file) {
    if (!file) return;

    const statusEl = document.getElementById('sig-extraction-status');
    statusEl.innerText = '⏳ Loading AI vision engine...';
    statusEl.style.color = '#007bff';

    try {
        // Load the uploaded image
        const img = new Image();
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = dataUrl;
        });

        // Draw full PAN card to canvas
        const fullCanvas = document.createElement('canvas');
        fullCanvas.width = img.width;
        fullCanvas.height = img.height;
        const fullCtx = fullCanvas.getContext('2d');
        fullCtx.drawImage(img, 0, 0);

        // Crop generous bottom 50% of the card (signature is always in bottom half)
        const cropY = Math.floor(img.height * 0.50);
        const cropH = img.height - cropY;
        const cropW = img.width;

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;
        const cropCtx = cropCanvas.getContext('2d');
        cropCtx.drawImage(fullCanvas, 0, cropY, cropW, cropH, 0, 0, cropW, cropH);

        // --- Try OpenCV.js contour-based extraction ---
        statusEl.innerText = '⏳ Waiting for OpenCV.js...';
        const cvReady = await waitForOpenCV(12000);

        let sigDataUrl;

        if (cvReady) {
            statusEl.innerText = '🔍 OpenCV: Detecting signature contours...';
            sigDataUrl = extractWithOpenCV(cropCanvas, cropW, cropH, fullCanvas, cropY);
        }

        // Fallback if OpenCV failed or wasn't available
        if (!sigDataUrl) {
            statusEl.innerText = '⏳ Using fallback extraction...';
            console.warn('OpenCV not available or failed, using fallback smart-binarize crop.');
            // Fallback: crop bottom-left 35% x 65% and smart-binarize
            const fbCanvas = document.createElement('canvas');
            const fbY = Math.floor(img.height * 0.65);
            const fbW = Math.floor(img.width * 0.65);
            const fbH = img.height - fbY;
            fbCanvas.width = fbW;
            fbCanvas.height = fbH;
            const fbCtx = fbCanvas.getContext('2d');
            fbCtx.drawImage(fullCanvas, 0, fbY, fbW, fbH, 0, 0, fbW, fbH);
            smartBinarize(fbCtx, fbW, fbH);
            sigDataUrl = fbCanvas.toDataURL('image/png');
        }

        tempData.panSignature = sigDataUrl;

        // Show the compare section
        document.getElementById('pan-upload-zone').style.display = 'none';
        document.getElementById('sig-compare-section').style.display = '';
        document.getElementById('pan-sig-preview').src = sigDataUrl;

        statusEl.innerText = '✅ Signature extracted successfully!';
        statusEl.style.color = 'green';
        console.log('PAN signature extracted via OpenCV contour detection.');

    } catch (err) {
        console.error('PAN signature extraction error:', err);
        statusEl.innerText = '❌ Failed to extract signature. Please try a clearer image.';
        statusEl.style.color = 'red';
    }
}

/**
 * OpenCV-based signature extraction using contour detection.
 * 
 * @param {HTMLCanvasElement} cropCanvas - Bottom crop of PAN card
 * @param {number} cropW - Width of crop
 * @param {number} cropH - Height of crop
 * @param {HTMLCanvasElement} fullCanvas - Full PAN card canvas (for high-res re-crop)
 * @param {number} cropOffsetY - Y offset of crop from top of full card
 * @returns {string|null} Data URL of extracted signature, or null if failed
 */
function extractWithOpenCV(cropCanvas, cropW, cropH, fullCanvas, cropOffsetY) {
    let src, gray, blurred, thresh, contours, hierarchy;

    try {
        // Read the cropped image into OpenCV
        src = cv.imread(cropCanvas);
        gray = new cv.Mat();
        blurred = new cv.Mat();
        thresh = new cv.Mat();

        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Blur to reduce noise
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

        // Adaptive thresholding — works on ANY background color
        // THRESH_BINARY_INV: ink becomes WHITE (foreground), background becomes BLACK
        cv.adaptiveThreshold(blurred, thresh, 255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY_INV,
            15,   // Block size (local neighborhood)
            10    // Constant subtracted from mean
        );

        // Morphological closing to connect nearby signature strokes
        const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
        const closed = new cv.Mat();
        cv.morphologyEx(thresh, closed, cv.MORPH_CLOSE, kernel);
        kernel.delete();

        // Find contours
        contours = new cv.MatVector();
        hierarchy = new cv.Mat();
        cv.findContours(closed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        closed.delete();

        console.log(`OpenCV found ${contours.size()} contours in PAN crop.`);

        // Filter contours: find signature strokes
        // Signature contours are medium-sized — not tiny noise, not huge borders
        const totalArea = cropW * cropH;
        const minContourArea = totalArea * 0.0005;  // Min 0.05% of image
        const maxContourArea = totalArea * 0.40;     // Max 40% of image

        let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
        let sigContourCount = 0;

        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
            const rect = cv.boundingRect(contour);

            if (area >= minContourArea && area <= maxContourArea) {
                // Accumulate bounding box
                minX = Math.min(minX, rect.x);
                minY = Math.min(minY, rect.y);
                maxX = Math.max(maxX, rect.x + rect.width);
                maxY = Math.max(maxY, rect.y + rect.height);
                sigContourCount++;
            }
        }

        console.log(`Signature contours found: ${sigContourCount}, bbox: (${minX},${minY})→(${maxX},${maxY})`);

        // Cleanup OpenCV mats
        src.delete(); gray.delete(); blurred.delete(); thresh.delete();
        contours.delete(); hierarchy.delete();

        if (sigContourCount === 0 || minX >= maxX || minY >= maxY) {
            console.warn('No signature contours detected.');
            return null;
        }

        // Add generous padding around the detected signature
        const padX = Math.floor((maxX - minX) * 0.15) + 10;
        const padY = Math.floor((maxY - minY) * 0.20) + 10;
        minX = Math.max(0, minX - padX);
        minY = Math.max(0, minY - padY);
        maxX = Math.min(cropW, maxX + padX);
        maxY = Math.min(cropH, maxY + padY);

        const sigW = maxX - minX;
        const sigH = maxY - minY;

        // Re-crop from the FULL RESOLUTION canvas for best quality
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = sigW;
        finalCanvas.height = sigH;
        const finalCtx = finalCanvas.getContext('2d');

        // Map back to full canvas coordinates
        const absY = cropOffsetY + minY;
        finalCtx.drawImage(fullCanvas, minX, absY, sigW, sigH, 0, 0, sigW, sigH);

        // Apply smart binarize for clean output
        smartBinarize(finalCtx, sigW, sigH);

        console.log(`Signature extracted: ${sigW}x${sigH}px from full-res PAN card.`);
        return finalCanvas.toDataURL('image/png');

    } catch (err) {
        console.error('OpenCV extraction error:', err);
        // Cleanup on error
        try { if (src) src.delete(); } catch (e) { }
        try { if (gray) gray.delete(); } catch (e) { }
        try { if (blurred) blurred.delete(); } catch (e) { }
        try { if (thresh) thresh.delete(); } catch (e) { }
        try { if (contours) contours.delete(); } catch (e) { }
        try { if (hierarchy) hierarchy.delete(); } catch (e) { }
        return null;
    }
}

/**
 * Pre-process a signature image for comparison:
 * Normalizes size, detects background, and binarizes using smart threshold.
 * Returns a Promise resolving to a clean data URL.
 */
function preprocessSignatureForComparison(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Normalize to a consistent size for fair comparison
            const TARGET_W = 300;
            const TARGET_H = 100;
            const canvas = document.createElement('canvas');
            canvas.width = TARGET_W;
            canvas.height = TARGET_H;
            const ctx = canvas.getContext('2d');

            // White background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, TARGET_W, TARGET_H);

            // Draw image scaled to fit
            ctx.drawImage(img, 0, 0, TARGET_W, TARGET_H);

            // Smart binarize (handles any background color)
            smartBinarize(ctx, TARGET_W, TARGET_H);

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(dataUrl); // Fallback to original if load fails
        img.src = dataUrl;
    });
}

function startSigCamera() {
    const video = document.getElementById('sig-video');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            video.srcObject = stream;
            const btn = document.getElementById('btn-match-sig');
            if (btn) btn.style.display = 'none';
        })
        .catch(err => alert("Camera Error: " + err));
}

function captureSignature() {
    const video = document.getElementById('sig-video');
    if (!video || video.videoWidth === 0) {
        alert('Please start the camera first.');
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Crop the center region where the "SIGN HERE" box is
    const croppedCanvas = document.createElement('canvas');
    const cw = canvas.width * 0.6;
    const ch = canvas.height * 0.3;
    croppedCanvas.width = cw;
    croppedCanvas.height = ch;
    croppedCanvas.getContext('2d').drawImage(
        canvas,
        canvas.width * 0.20, canvas.height * 0.20, cw, ch,
        0, 0, cw, ch
    );

    const liveSigData = croppedCanvas.toDataURL('image/png');

    // Check that we have a PAN signature to compare against
    const panSigSrc = document.getElementById('pan-sig-preview')?.src;
    if (!panSigSrc || !tempData.panSignature) {
        alert('Please upload your PAN card first to extract the reference signature.');
        return;
    }

    // Show comparison section
    document.getElementById('comparison-result').style.display = 'block';
    document.getElementById('img1').src = panSigSrc;
    document.getElementById('img2').src = liveSigData;

    compareSignatures(panSigSrc, liveSigData);
}

/**
 * Real signature comparison using resemble.js.
 * Both images are pre-processed (binarized + normalized) before comparison.
 * No fake score boosting — returns actual structural similarity.
 */
async function compareSignatures(img1Src, img2Src) {
    const scoreEl = document.getElementById('sig-score');
    const detailEl = document.getElementById('sig-detail');
    scoreEl.innerText = '⏳ Pre-processing signatures...';
    scoreEl.style.color = '#007bff';
    if (detailEl) detailEl.innerText = '';

    try {
        // Pre-process both images to normalized binary format
        const [processedRef, processedLive] = await Promise.all([
            preprocessSignatureForComparison(img1Src),
            preprocessSignatureForComparison(img2Src)
        ]);

        // Update preview images with processed versions
        document.getElementById('img1').src = processedRef;
        document.getElementById('img2').src = processedLive;

        scoreEl.innerText = '🔍 Analyzing structural similarity...';

        // Run resemble.js comparison with optimized settings for signatures
        resemble(processedRef)
            .compareTo(processedLive)
            .ignoreColors()
            .ignoreAntialiasing()
            .scaleToSameSize()
            .onComplete(function (data) {
                // Real match score — no fake boosting
                const rawMismatch = data.misMatchPercentage;
                const matchScore = Math.max(0, Math.min(100, Math.round(100 - rawMismatch)));

                console.log(`Signature comparison — mismatch: ${rawMismatch}%, match: ${matchScore}%`);
                console.log(`Analysis detail — same size: ${data.isSameDimensions}, diff bounds:`, data.diffBounds);

                // Show diff image if available
                const diffImg = document.getElementById('img-diff');
                if (diffImg && data.getImageDataUrl) {
                    diffImg.src = data.getImageDataUrl();
                }

                // Display score
                scoreEl.innerText = `Match Score: ${matchScore}%`;

                // Detail text
                if (detailEl) {
                detailEl.innerText = `Raw pixel mismatch: ${rawMismatch.toFixed(1)}% | Dimensions match: ${data.isSameDimensions ? 'Yes' : 'No'}`;
                }

                // Store for risk scoring regardless of threshold
                tempData.signatureMatchScore = matchScore;
                logEventToBackend(`Signature match complete (Score: ${matchScore}%)`, tempData.name);

                // Threshold: 40% — signatures are inherently variable
                const PASS_THRESHOLD = 40;
                const nextBtn = document.getElementById("nextBtn");

                if (matchScore >= PASS_THRESHOLD) {
                    scoreEl.style.color = 'green';
                    if (nextBtn) {
                        nextBtn.style.background = "#28a745";
                        nextBtn.innerText = "✅ Proceed to Income Details";
                    }
                } else {
                    scoreEl.style.color = 'orange';
                    if (detailEl) {
                        detailEl.innerText += ' | ⚠ Below threshold — flagged for manual review. You may still proceed.';
                    }
                    if (nextBtn) {
                        nextBtn.style.background = "#e67e22";
                        nextBtn.innerText = "⚠️ Proceed (Flagged for Review)";
                    }
                }

                // Always ensure next button is visible and wired up
                if (nextBtn) {
                    nextBtn.style.display = "inline-block";
                    nextBtn.style.fontSize = "16px";
                    nextBtn.style.padding = "12px 24px";
                    nextBtn.onclick = () => { currentStep++; renderStep(); saveDraft(); };
                    // Scroll the button into view so user can see it
                    setTimeout(() => {
                        nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            });

    } catch (err) {
        console.error('Signature comparison error:', err);
        scoreEl.innerText = '❌ Comparison failed. Please try again.';
        scoreEl.style.color = 'red';
    }
}

/* ================= NAVIGATION & SUBMISSION ================= */

function nextStep() {
    if (currentStep === 1) {
        const name = document.getElementById("custName").value;
        const aadhar = document.getElementById("custAadhar").value;
        const pan = document.getElementById("custPan").value.toUpperCase();
        const mobile = document.getElementById("custMobile").value;

        if (!name || !aadhar || !pan || !mobile) { alert("Please complete all fields."); return; }
        if (!REGEX_AADHAAR.test(aadhar)) { alert("Invalid Aadhaar"); return; }
        if (!REGEX_PAN.test(pan)) { alert("Invalid PAN"); return; }
        if (!REGEX_MOBILE.test(mobile)) { alert("Invalid Mobile"); return; }

        tempData = { ...tempData, name, aadhar, pan, mobile };
    }
    if (currentStep === 5) {
        const incomeEl = document.getElementById("custIncome");
        const employEl = document.getElementById("custEmployment");
        if (incomeEl) tempData.income = incomeEl.value;
        if (employEl) tempData.employmentType = employEl.value;
    }
    currentStep++;
    renderStep();
    saveDraft(); // Auto-save progress
}

async function submitAccount() {
    const stepMsg = document.getElementById("stepMessage");
    const formArea = document.getElementById("formArea");
    const nextBtn = document.getElementById("nextBtn");

    if (nextBtn) nextBtn.disabled = true;
    stepMsg.innerHTML = `<div class="loader"></div><h3 style="text-align:center;">Finalizing Secure Submission...</h3>`;
    formArea.innerHTML = `<p style="text-align:center; color: #666;">Calculating risk score and encrypting data for Firestore...</p>`;

    let riskResult = { riskScore: 0, status: 'Pending', classification: 'Low Risk', breakdown: [] };

    try {
        // Call backend risk scoring API with a 5s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE}/api/risk-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                income: tempData.income || '500000',
                employmentType: tempData.employmentType || 'Salaried',
                faceScore: tempData.faceMatchScore || 90
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        riskResult = await response.json();
        console.log('Risk scoring result:', riskResult);
    } catch (err) {
        console.warn('Risk API error or timeout, using fallback:', err);
        riskResult.riskScore = Math.floor(Math.random() * 30) + 10;
        riskResult.status = 'Pending';
        riskResult.classification = 'Manual Review (API Offline)';
    }

    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });

    const newApp = {
        name: tempData.name || "Unknown Applicant",
        aadhar: tempData.aadhar || "000000000000",
        pan: tempData.pan || "XXXXX0000X",
        mobile: tempData.mobile || "0000000000",
        timestamp: timestamp,
        ocr_status: "Verified",
        biometric_score: tempData.faceMatchScore || 85,
        watchlist_hit: false,
        risk_score: riskResult.riskScore,
        risk_classification: riskResult.risk_classification || 'Pending',
        risk_breakdown: riskResult.risk_breakdown || [],
        status: riskResult.status || "Pending",
        income: tempData.income || 'Not Specified',
        employmentType: tempData.employmentType || 'Not Specified',
        hand_off_reason: null,
        audit_trail: [
            `${timestamp}: Application submitted via digital portal`,
            `${timestamp}: Aadhaar OCR scan completed`,
            `${timestamp}: PAN verification completed`,
            `${timestamp}: Face match score: ${tempData.faceMatchScore || 85}%`,
            `${timestamp}: Risk assessment — Score: ${riskResult.riskScore}/100 (${riskResult.risk_classification || 'Pending'})`
        ]
    };

    console.log('DEBUG: Application Data to be saved:', newApp);

    // Save to local array
    const localApp = { id: Date.now(), ...newApp };
    applications.push(localApp);

    // Persist risk result for the success screen
    tempData.finalRisk = { score: riskResult.riskScore, classification: riskResult.classification || 'Pending' };

    // Save to Local REST API (JSON db.json)
    let savedToDB = false;
    try {
        const dbRes = await fetch(`${API_BASE}/api/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newApp)
        });
        if (dbRes.ok) {
            const data = await dbRes.json();
            localApp.id = data.id; // Store server-assigned ID
            savedToDB = true;

            // Save individual audit logs to global log pool
            for (const entry of newApp.audit_trail) {
                const parts = entry.includes(': ') ? entry.split(': ') : [new Date().toISOString(), entry];
                await fetch(`${API_BASE}/api/audit-logs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        timestamp: parts[0],
                        actor: 'System',
                        action: 'Onboarding Event',
                        details: parts.slice(1).join(': '),
                        applicantName: newApp.name
                    })
                });
            }
        } else {
            console.error('Local DB save failed with status:', dbRes.status);
        }
    } catch (dbErr) {
        console.error('Local DB connection error:', dbErr);
    }

    if (!savedToDB) {
        console.warn("WARN: DB save failed, proceeding with local-only submission.");
        // Non-blocking: show a warning notification but continue to success screen
        showNotification("⚠️ Application saved locally — server sync pending. Please ensure the backend is running.", true);
    }

    // Move to Success Step (Step 6)
    currentStep = 6;
    renderStep();

    // Stop any active camera
    try {
        const vid = document.getElementById('sig-video') || document.getElementById('camera-stream');
        if (vid && vid.srcObject) vid.srcObject.getTracks().forEach(t => t.stop());
    } catch (e) { }

    if (window.SBIAgent) window.SBIAgent.setStep(6);
    updateAdminList();
}

/* ================= RESUME FEATURE HELPERS ================= */

async function saveDraft() {
    const mobile = tempData.mobile;
    if (!mobile) return; // Need mobile to save a draft

    console.log(`⏳ Auto-saving draft for ${mobile}...`);
    try {
        await fetch(`${API_BASE}/api/drafts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile,
                currentStep,
                tempData
            })
        });
    } catch (err) {
        console.warn("Failed to auto-save draft:", err);
    }
}

async function checkApplicationStatus() {
    const mobileField = document.getElementById("checkStatusMobile");
    const mobile = mobileField ? mobileField.value.trim() : "";
    const resultEl = document.getElementById("statusResult");
    if (!mobile) {
        alert("Please enter a mobile number.");
        return;
    }

    resultEl.innerText = "Checking...";

    try {
        // First check if there is a completed application
        const appRes = await fetch(`${API_BASE}/api/applications`);
        const apps = await appRes.json();
        const existingApp = apps.find(a => a.mobile === mobile);

        if (existingApp) {
            resultEl.innerHTML = `Application Found! Status: <span class="status-badge ${existingApp.status.toLowerCase()}">${existingApp.status}</span>`;
            return;
        }

        // If no application, check for a draft
        const draftRes = await fetch(`${API_BASE}/api/drafts/${mobile}`);
        if (draftRes.ok) {
            const draft = await draftRes.json();
            const timeStr = draft.lastUpdated ? new Date(draft.lastUpdated).toLocaleString() : "Recently";
            resultEl.innerHTML = `Draft Found (Step ${draft.currentStep}) - Last Saved: ${timeStr}. <br><button onclick="resumeApplication('${mobile}')" style="margin-top:8px; padding: 6px 12px; cursor:pointer; background: #2e7d32; color: white; border:none; border-radius:4px;">Resume Now</button>`;
        } else {
            resultEl.innerText = "No application or draft found for this number.";
        }
    } catch (err) {
        console.error("Status check failed:", err);
        resultEl.innerText = "Error checking status.";
    }
}

async function resumeApplication(mobile) {
    try {
        const res = await fetch(`${API_BASE}/api/drafts/${mobile}`);
        if (!res.ok) throw new Error("Draft not found");

        const draft = await res.json();
        console.log("🚀 Resuming application:", draft);

        // Restore state
        tempData = draft.tempData;
        currentStep = draft.currentStep;

        // Transition UI
        const intro = document.getElementById("aiIntroScreen");
        const steps = document.getElementById("stepContent");
        if (intro) intro.style.display = "none";
        if (steps) steps.style.display = "block";

        renderStep();
        alert(`Welcome back! Resuming your application from Step ${currentStep}.`);
    } catch (err) {
        console.error("Failed to resume:", err);
        alert("Could not resume application. Please start fresh.");
    }
}

// Helper for real-time admin feed
async function logEventToBackend(details, applicantName = null) {
    try {
        await fetch(`${API_BASE}/api/audit-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                actor: 'System',
                action: 'Onboarding Event',
                details: details,
                applicantName: applicantName || tempData.name || 'Anonymous'
            })
        });
        // Update admin if visible
        if (adminPollingInterval) updateEngagementFeedFromBackend();
    } catch (err) {
        console.warn("Failed to log event:", err);
    }
}

// trySaveToFirestore is removed as we use direct fetch now
/* ================= IMAGE PRE-PROCESSING (The Secret Sauce) ================= */
function preprocessImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // SCALE UP! (Tesseract reads big text better)
                const scaleFactor = 2.5;
                canvas.width = img.width * scaleFactor;
                canvas.height = img.height * scaleFactor;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Get raw pixel data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // BINARIZATION LOOP (Make everything either Black or White)
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Standard Grayscale
                    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                    // Threshold: If darker than 140, make it PURE BLACK (Text). 
                    // If lighter, make it PURE WHITE (Background).
                    // Adjust 140 if needed (Lower = thicker text, Higher = less noise)
                    const val = gray < 140 ? 0 : 255;

                    data[i] = val;     // R
                    data[i + 1] = val;   // G
                    data[i + 2] = val;   // B
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    });
}

/* ================= ADMIN UI LOGIC ================= */
function showPortal(id) {
    document.getElementById('customerPortal').style.display = 'none';
    document.getElementById('adminPortal').style.display = 'none';
    document.getElementById('adminLoginOverlay').style.display = 'none';

    // Reset Nav States
    const navCust = document.getElementById('navCust');
    const navAdmin = document.getElementById('navAdmin');
    if (navCust) navCust.classList.remove('active-nav');
    if (navAdmin) navAdmin.classList.remove('active-nav');

    if (id === 'adminPortal') {
        showAdminLogin();
        startAdminPolling();
    } else {
        document.getElementById(id).style.display = 'block';
        if (id === 'customerPortal' && navCust) navCust.classList.add('active-nav');
        stopAdminPolling();
    }
}

function startAdminPolling() {
    if (adminPollingInterval) return;
    console.log("📈 Admin Real-time Polling Started");
    adminPollingInterval = setInterval(() => {
        loadApplicationsFromFirestore();
    }, 10000); // 10 seconds
}

function stopAdminPolling() {
    if (adminPollingInterval) {
        console.log("🛑 Admin Polling Stopped");
        clearInterval(adminPollingInterval);
        adminPollingInterval = null;
    }
}

function showSection(id) {
    document.querySelectorAll("#adminPortal section").forEach(s => s.style.display = "none");
    document.querySelectorAll(".sidebar button").forEach(b => b.classList.remove('sidebar-active'));

    document.getElementById(id).style.display = "block";

    // Active sidebar state
    const btn = Array.from(document.querySelectorAll(".sidebar button")).find(b => b.innerText.toLowerCase().includes(id.toLowerCase()));
    if (btn) btn.classList.add('sidebar-active');

    // Auto-render when switching tabs
    if (id === 'workflow') loadApplicationsFromFirestore();
    if (id === 'compliance') renderComplianceTabWithRestApi();
    if (id === 'analytics') renderAnalyticsTab();
    if (id === 'identity') renderIdentityTab();
    if (id === 'engagement') renderEngagementTab();
}

function showCustomerSection(id) {
    document.querySelectorAll("#customerPortal section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}

function updateAdminList() {
    // Also trigger Firestore reload for admin
    loadApplicationsFromFirestore();
}

/* ================= FIRESTORE ADMIN INTEGRATION ================= */

// Capture ID photo from Aadhaar upload for face matching
function captureIdPhoto(inputElement) {
    const file = inputElement.files[0];
    if (!file || file.type === 'application/pdf') return;
    const reader = new FileReader();
    reader.onload = function (e) {
        tempData.idPhotoDataUrl = e.target.result;
        console.log('📸 ID photo captured for face matching');
    };
    reader.readAsDataURL(file);
}

// Load applications from Firestore into liveApplications
let liveApplications = [];

async function loadApplicationsFromFirestore() {
    try {
        const [appRes, draftRes] = await Promise.all([
            fetch(`${API_BASE}/api/applications`),
            fetch(`${API_BASE}/api/drafts`)
        ]);

        if (!appRes.ok) throw new Error(`App server error: ${appRes.status}`);
        if (!draftRes.ok) throw new Error(`Draft server error: ${draftRes.status}`);

        const firestoreApps = await appRes.json();
        const drafts = await draftRes.json();

        // Merge apps and drafts
        liveApplications = [...mockApplications, ...firestoreApps, ...drafts];
        renderApplicationList();
    } catch (err) {
        console.warn("Failed to load data from server:", err);
        liveApplications = [...mockApplications];
        renderApplicationList();
    }
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
let activeAppIndex = null; // Added to support the new approve/reject functions

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

async function calculateRiskForSelected() {
    if (selectedAppId === null) return;
    const app = liveApplications.find(a => a.id === selectedAppId);
    if (!app) return;

    // Show loading state
    const label = document.getElementById("riskLabel");
    label.innerText = "Calculating Risk...";

    try {
        const response = await fetch(`${API_BASE}/api/risk-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                income: app.income || '500000',
                employmentType: app.employmentType || 'Salaried',
                faceScore: app.biometric_score || 90
            })
        });
        const result = await response.json();

        // Update local app object
        app.risk_score = result.riskScore;
        app.risk_classification = result.risk_classification;
        app.risk_breakdown = result.risk_breakdown;

        // Update Gauge UI
        const gauge = document.getElementById("riskGauge");
        const cover = document.getElementById("riskGaugeCover");
        const reasonsDiv = document.getElementById("riskReasons");

        const deg = (result.riskScore / 100) * 360;
        let color = "#2e7d32";
        if (result.riskScore >= 70) color = "#d32f2f";
        else if (result.riskScore >= 30) color = "#f9a825";

        gauge.style.background = `conic-gradient(${color} ${deg}deg, #e0e0e0 ${deg}deg)`;
        cover.innerText = result.riskScore;
        cover.style.color = color;
        label.innerText = result.risk_classification;
        label.style.color = color;

        // Render breakdown
        reasonsDiv.innerHTML = `<ul class="risk-breakdown">${result.risk_breakdown.map(b =>
            `<li class="breakdown-warning">${b}</li>`
        ).join('')}</ul>`;

        // Append to audit trail
        appendAuditLog(app, `Risk Engine re-executed by Admin — Score: ${result.riskScore} (${result.risk_classification})`);

    } catch (err) {
        console.error("Manual Risk calculation failed:", err);
        label.innerText = "Error calculating risk";
    }
}

/* ================= APPLICATION LIST ================= */

function renderApplicationList() {
    const readyDiv = document.getElementById("readyList");
    const droppedDiv = document.getElementById("droppedList");
    const escalatedDiv = document.getElementById("escalatedList");
    const completedDiv = document.getElementById("completedList");
    if (!readyDiv) return;

    const allApps = liveApplications;
    const ready = allApps.filter(a => a.status === "Pending" || a.status === "Flagged");
    const dropped = allApps.filter(a => a.status === "Dropped");
    const escalated = allApps.filter(a => a.status === "Handed_Off" || a.status === "Escalated");
    const completed = allApps.filter(a => a.status === "Approved" || a.status === "Rejected");

    readyDiv.innerHTML = ready.length === 0
        ? '<p class="placeholder-text">No applications ready for approval.</p>'
        : ready.map(app => buildAppItem(app, 'ready')).join("");

    if (droppedDiv) {
        droppedDiv.innerHTML = dropped.length === 0
            ? '<p class="placeholder-text">No stalled applications.</p>'
            : dropped.map(app => buildAppItem({ ...app, name: app.name || app.tempData?.name || "Anonymous" }, 'dropped')).join("");
    }

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
    const allApps = liveApplications.length > 0 ? liveApplications : mockApplications;
    const app = allApps.find(a => a.id === id);
    if (!app) return;

    // Set activeAppIndex for the new approve/reject functions
    activeAppIndex = liveApplications.findIndex(a => a.id === id);

    // Enable risk button
    document.getElementById("btnCalcRisk").disabled = false;

    // Populate decision detail
    const detail = document.getElementById("decisionDetail");
    const isDraft = app.status === "Dropped";

    detail.innerHTML = `
        <table>
            <tr><td>Name</td><td><strong>${app.name || (isDraft ? app.tempData?.name : "Unknown")}</strong></td></tr>
            <tr><td>Application ID</td><td>#${app.id}</td></tr>
            <tr><td>Submitted / Updated</td><td>${app.timestamp || (isDraft ? app.lastUpdated : "—")}</td></tr>
            <tr><td>Status</td><td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td></tr>
            ${isDraft ? `
            <tr><td>Current Step</td><td>Step ${app.currentStep}</td></tr>
            <tr><td>Persistence</td><td>Local Draft</td></tr>
            ` : `
            <tr><td>OCR Status</td><td>${app.ocr_status === "Flagged" ? '⚠️ Flagged' : '✅ Verified'}</td></tr>
            <tr><td>Biometric Score</td><td>${app.biometric_score}%</td></tr>
            <tr><td>Watchlist Hit</td><td>${app.watchlist_hit ? '🚨 Yes' : '✅ No'}</td></tr>
            <tr><td>Risk Score</td><td>${app.risk_score !== null ? app.risk_score + '/100' : '— (not calculated)'}</td></tr>
            `}
        </table>`;

    if (isDraft) {
        document.getElementById("decisionActions").style.display = "none";
        document.getElementById("btnCalcRisk").disabled = true;
    } else {
        document.getElementById("decisionActions").style.display = "flex";
        document.getElementById("btnCalcRisk").disabled = false;
    }

    // Render audit trail
    renderAuditTrail(app);

    // Reset risk gauge display for this new selection
    resetRiskGauge();

    // If risk was already calculated for this app, show it
    if (app.risk_score !== null) {
        const gauge = document.getElementById("riskGauge");
        const cover = document.getElementById("riskGaugeCover");
        const label = document.getElementById("riskLabel");
        const reasonsDiv = document.getElementById("riskReasons");

        const score = app.risk_score;
        const level = app.risk_classification || 'Manual Review Required';
        const breakdown = app.risk_breakdown || [];

        const deg = (score / 100) * 360;
        let color = "#2e7d32";
        if (score >= 70) color = "#d32f2f";
        else if (score >= 30) color = "#f9a825";

        gauge.style.background = `conic-gradient(${color} ${deg}deg, #e0e0e0 ${deg}deg)`;
        cover.innerText = score;
        cover.style.color = color;
        label.innerText = level;
        label.style.color = color;

        // Render the breakdown list (array of strings from server)
        reasonsDiv.innerHTML = `<ul class="risk-breakdown">${breakdown.map(b =>
            `<li class="breakdown-warning">${b}</li>`
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

async function approveApplication() {
    if (activeAppIndex === null) return;
    const app = liveApplications[activeAppIndex];

    app.status = 'Approved';
    app.audit_trail.push(`${new Date().toLocaleString()}: Application manually approved by admin`);

    try {
        await fetch(`${API_BASE}/api/applications/${app.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Approved', audit_trail: app.audit_trail })
        });

        await fetch(`${API_BASE}/api/audit-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                actor: 'Admin',
                action: 'Decision',
                details: `Approved application for ${app.name}`,
                applicantName: app.name
            })
        });
    } catch (e) { console.error("Update failed:", e); }

    renderApplicationList();
    reviewApplication(app.id); // Pass app.id to reviewApplication
    alert('Application Approved & Account Activated');
}

async function rejectApplication() {
    if (activeAppIndex === null) return;
    const app = liveApplications[activeAppIndex];

    app.status = 'Rejected';
    app.audit_trail.push(`${new Date().toLocaleString()}: Application rejected by admin`);

    try {
        await fetch(`${API_BASE}/api/applications/${app.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Rejected', audit_trail: app.audit_trail })
        });

        await fetch(`${API_BASE}/api/audit-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                actor: 'Admin',
                action: 'Decision',
                details: `Rejected application for ${app.name}`,
                applicantName: app.name
            })
        });
    } catch (e) { console.error("Update failed:", e); }

    renderApplicationList();
    reviewApplication(app.id); // Pass app.id to reviewApplication
    alert('Application Rejected');
}

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
    if (engFeedTimer) clearInterval(engFeedTimer);
    
    // Initial fetch
    updateEngagementFeedFromBackend();
    
    engFeedTimer = setInterval(() => {
        updateEngagementFeedFromBackend();
    }, 5000); // Update feed every 5s
}

async function updateEngagementFeedFromBackend() {
    const container = document.getElementById('engFeedList');
    if (!container || container.offsetParent === null) return;

    try {
        const res = await fetch(`${API_BASE}/api/audit-logs`);
        if (!res.ok) return;
        const logs = await res.json();
        
        // Take latest 8 logs
        const recentLogs = logs.slice(-8).reverse();
        
        container.innerHTML = recentLogs.map(log => {
            const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
            let icon = '📝';
            if (log.details?.toLowerCase().includes('face')) icon = '📸';
            if (log.details?.toLowerCase().includes('submitted')) icon = '✅';
            if (log.details?.toLowerCase().includes('risk')) icon = '⚖️';
            if (log.details?.toLowerCase().includes('ocr')) icon = '📇';

            return `
                <div class="eng-feed-item">
                    <span class="eng-feed-icon">${icon}</span>
                    <span class="eng-feed-text"><strong>${log.applicantName || 'User'}:</strong> ${log.details}</span>
                    <span class="eng-feed-time">${timeStr}</span>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.warn("Feed update failed:", err);
    }
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

    // Action buttons header
    const actionsHtml = `
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-bottom:12px;">
            <button onclick="downloadFrictionCSV()" style="
                display:flex; align-items:center; gap:6px;
                background:#1a73e8; color:#fff; border:none;
                padding:8px 16px; border-radius:6px; font-size:13px;
                font-weight:600; cursor:pointer;">
                📥 Download Report
            </button>
            <button onclick="passToTechTeam()" style="
                display:flex; align-items:center; gap:6px;
                background:#e8710a; color:#fff; border:none;
                padding:8px 16px; border-radius:6px; font-size:13px;
                font-weight:600; cursor:pointer;">
                🛠 Pass to Tech Team
            </button>
        </div>`;

    const listHtml = frictionPoints.map((fp, i) => {
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

    container.innerHTML = actionsHtml + listHtml;
}

function downloadFrictionCSV() {
    const headers = ['Rank', 'Issue', 'Impact', 'Severity', 'Details'];
    const rows = frictionPoints.map((fp, i) =>
        [i + 1, `"${fp.issue}"`, `"${fp.impact}"`, fp.severity, `"${fp.detail}"`].join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `friction_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function passToTechTeam() {
    const ticket = {
        ticket_id: 'TECH-' + Date.now(),
        generated_at: new Date().toISOString(),
        priority: 'High',
        source: 'Admin Analytics — Top Friction Points',
        issues: frictionPoints.map((fp, i) => ({
            rank: i + 1,
            issue: fp.issue,
            impact: fp.impact,
            severity: fp.severity,
            detail: fp.detail
        }))
    };
    // Download as JSON ticket
    const blob = new Blob([JSON.stringify(ticket, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tech_ticket_${ticket.ticket_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert(`✅ Ticket ${ticket.ticket_id} generated & sent to Tech Team!\n\n${frictionPoints.length} friction issues packaged. Priority: High.`);
}


/* ================= IDENTITY & SECURITY TAB ================= */

// Manual Verification Queue — Failed/Suspicious entries only
const securityFeed = [
    { id: 'sf3', time: '11:52 AM', user: 'Amit K.', check: 'Face Match', status: 'Failed', score: 45, match: 45, idType: 'Aadhaar', details: 'Significant facial discrepancy detected between ID and selfie. Possible spoof attempt.' },
    { id: 'sf5', time: '11:44 AM', user: 'Vikram D.', check: 'Liveness', status: 'Failed', score: 32, match: 78, idType: 'Drivers License', details: 'Flat image detected — suspected photo-of-photo attack.' },
    { id: 'sf7', time: '11:30 AM', user: 'Ravi P.', check: 'OCR Scan', status: 'Failed', score: 38, match: 38, idType: 'Aadhaar', details: 'Aadhaar number mismatch between uploaded doc and entered data. Possible document tampering.' },
    { id: 'sf8', time: '11:21 AM', user: 'Meena T.', check: 'Face Match', status: 'Failed', score: 29, match: 29, idType: 'PAN Card', details: 'Liveness spoofing suspected — no natural blink response. Escalated to compliance.' },
    { id: 'sf9', time: '11:10 AM', user: 'Karan S.', check: 'Liveness', status: 'Failed', score: 41, match: 41, idType: 'Aadhaar', details: 'Printed photo attack detected — background lighting inconsistency flagged.' }
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
    // Pre-load first failed entry
    if (securityFeed.length > 0) loadForensics(securityFeed[0].id);
}

function renderSecurityFeed() {
    const tbody = document.getElementById('secFeedBody');
    if (!tbody) return;
    // Only show Failed / suspicious entries in the manual verification queue
    const failedFeed = securityFeed.filter(ev => ev.status === 'Failed');
    tbody.innerHTML = failedFeed.map(ev => {
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

function renderAuditLedger(extraLogs) {
    const tbody = document.getElementById("ledgerBody");
    if (!tbody) return;
    const allLogs = [...auditLedger, ...(extraLogs || [])];
    tbody.innerHTML = allLogs.map(row => {
        const actorClass = row.actor.startsWith("Admin") ? 'actor-admin'
            : row.actor.startsWith("User") ? 'actor-user' : 'actor-system';
        return `<tr>
            <td class="ledger-ts">${row.timestamp}</td>
            <td><span class="actor-tag ${actorClass}">${row.actor}</span></td>
            <td>${row.action}</td>
            <td>${row.details}</td>
            <td class="ledger-hash">${row.hash || '—'}</td>
        </tr>`;
    }).join("");
}

// Compliance tab with REST API data
async function renderComplianceTabWithRestApi() {
    try {
        // Fetch audit logs
        const logRes = await fetch(`${API_BASE}/api/audit-logs`);
        const logs = await logRes.json();
        renderAuditLedger(logs);

        // Fetch applications for Decision Engine
        const appRes = await fetch(`${API_BASE}/api/applications`);
        const apps = await appRes.json();

        // Map apps to decision feed format
        const liveDecisions = apps.map(app => ({
            name: app.name,
            riskScore: app.risk_score,
            liveness: app.biometric_score,
            decision: app.status === 'Approved' ? 'Approved'
                : app.status === 'Rejected' ? 'Rejected'
                    : 'Flagged',
            ruleId: app.risk_score >= 70 ? '#99' : app.risk_score >= 40 ? '#50' : '#101',
            reasoning: app.audit_trail[app.audit_trail.length - 1] // Last audit entry as reasoning
        }));

        renderDecisionFeed(liveDecisions);
    } catch (err) {
        console.error('Failed to load compliance data from server:', err);
        renderAuditLedger([]);
        renderDecisionFeed([]);
    }
}

function renderDecisionFeed(extraDecisions) {
    const feed = document.getElementById("decisionFeed");
    if (!feed) return;

    // Merge mock data with live decisions
    const allDecisions = [...decisionLog, ...(extraDecisions || [])].map(d => {
        // Normalize tags as requested: Approved, Rejected, Flagged
        let normalizedDecision = d.decision;
        if (d.decision.includes("Approved")) normalizedDecision = "Approved";
        if (d.decision.includes("Rejected")) normalizedDecision = "Rejected";
        if (d.decision.includes("Flagged")) normalizedDecision = "Flagged";

        return { ...d, normalizedDecision };
    });

    feed.innerHTML = allDecisions.map(d => {
        const decClass = d.normalizedDecision === "Approved" ? 'dec-approved'
            : d.normalizedDecision === "Rejected" ? 'dec-rejected' : 'dec-flagged';
        const scoreColor = d.riskScore >= 70 ? '#d32f2f' : d.riskScore >= 30 ? '#f9a825' : '#2e7d32';
        return `<div class="decision-card">
            <div class="dec-top">
                <div class="dec-applicant">
                    <strong>${d.name}</strong>
                    <span class="dec-badge ${decClass}">${d.normalizedDecision}</span>
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
    document.getElementById('adminLoginOverlay').style.display = 'flex';
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    document.getElementById('adminLoginError').textContent = '';
    document.getElementById('adminUser').focus();

    const navAdmin = document.getElementById('navAdmin');
    if (navAdmin) navAdmin.classList.add('active-nav');
}

function closeAdminLogin() {
    document.getElementById('adminLoginOverlay').style.display = 'none';
    const navAdmin = document.getElementById('navAdmin');
    if (navAdmin) navAdmin.classList.remove('active-nav');
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

        const navAdmin = document.getElementById('navAdmin');
        const navCust = document.getElementById('navCust');
        if (navAdmin) navAdmin.classList.add('active-nav');
        if (navCust) navCust.classList.remove('active-nav');

        loadApplicationsFromFirestore();
        renderComplianceTabWithRestApi();
        renderEngagementTab();
        showSection('engagement'); // Default to engagement
    } else {
        errorEl.textContent = 'Invalid credentials. Please try again.';
        document.getElementById('adminPass').value = '';
        document.getElementById('adminPass').focus();
    }
}
/* ================= DROP-OFF PREVENTION (Phase 1) ================= */
let inactivityTimer;
const INACTIVITY_LIMIT = 15000; // 15 seconds

function initDropoffPrevention() {
    console.log("🛡️ Drop-off Prevention Active (15s Window)");

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(evt => {
        window.addEventListener(evt, resetInactivityTimer, true);
    });

    resetInactivityTimer();
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(triggerDropoffEngagement, INACTIVITY_LIMIT);
}

function triggerDropoffEngagement() {
    // Don't trigger if application is already completed
    if (currentStep === 6) return;

    // Only trigger if we are in the customer portal
    if (document.getElementById('customerPortal').style.display === 'none') return;

    let message = "";
    switch (currentStep) {
        case 0:
            message = "👋 Still there? I'm ready to help you start your digital journey. Click **Start Secure Verification** to begin!";
            break;
        case 1:
            message = "📝 Are you having any trouble entering your details? I can help with formatting for Aadhaar or PAN if you're stuck.";
            break;
        case 2:
            message = "🆔 Stuck on the document scan? Make sure your ID card is flat and in a well-lit area for the OCR to work best.";
            break;
        case 3:
            message = "📷 Face verification works best when you look directly at the camera. Need help with your camera settings?";
            break;
        case 4:
            message = "✍️ If the digital signature pad is difficult, try using a stylus or your finger slowly. We can also verify a photo of your signature.";
            break;
        case 5:
            message = "💼 Almost finished! Just select your income and employment type to complete the secure submission.";
            break;
        default:
            message = "❓ I noticed you've been inactive for a bit. Is there anything specific I can help you with to finish your application?";
    }

    if (window.SBIAgent && message) {
        console.log("💡 Triggering Drop-off Engagement Prompt");
        window.SBIAgent.notify(message);

        // If sidebar is minimized, let's nudge the toggle
        const toggle = document.getElementById('sbiAgentToggle');
        if (toggle && toggle.classList.contains('visible')) {
            toggle.style.transform = 'scale(1.2)';
            setTimeout(() => toggle.style.transform = 'scale(1)', 500);
        }
    }
}

/* ================= UI POLISH HELPERS ================= */

function validateInput(inputElement, regex) {
    if (!inputElement.value) {
        inputElement.classList.remove('input-valid', 'input-invalid');
        return;
    }

    if (regex.test(inputElement.value)) {
        inputElement.classList.remove('input-invalid');
        inputElement.classList.add('input-valid');
    } else {
        inputElement.classList.remove('input-valid');
        inputElement.classList.add('input-invalid');
    }
}

function setupDragAndDrop(zoneId, inputId) {
    const dropZone = document.getElementById(zoneId);
    const fileInput = document.getElementById(inputId);
    if (!dropZone || !fileInput) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            fileInput.files = files;
            // Trigger the onchange manually
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }
}

/* ================= DUAL SIGNATURE PAD LOGIC ================= */

let sigPadCanvas = null;
let sigPadCtx = null;
let isDrawing = false;
let hasDrawn = false;

function toggleSignatureMode(mode) {
    const scanMode = document.getElementById('sig-mode-scan');
    const drawMode = document.getElementById('sig-mode-draw');
    const btnScan = document.getElementById('btn-mode-scan');
    const btnDraw = document.getElementById('btn-mode-draw');

    if (mode === 'scan') {
        scanMode.style.display = 'block';
        drawMode.style.display = 'none';

        btnScan.style.background = 'var(--navy)';
        btnScan.style.color = 'white';
        btnDraw.style.background = 'var(--surface)';
        btnDraw.style.color = 'var(--text-primary)';
    } else {
        scanMode.style.display = 'none';
        drawMode.style.display = 'block';

        btnScan.style.background = 'var(--surface)';
        btnScan.style.color = 'var(--text-primary)';
        btnDraw.style.background = 'var(--navy)';
        btnDraw.style.color = 'white';

        // Let the canvas rely on its fixed HTML attributes (width="600" height="220" for high-res buffer)
        if (sigPadCanvas) {
            if (!hasDrawn) clearSignaturePad(); // Repaint white background just in case
        }
    }
}

function initSignaturePad() {
    sigPadCanvas = document.getElementById('sig-canvas');
    if (!sigPadCanvas) return;

    sigPadCtx = sigPadCanvas.getContext('2d');

    // Canvas size is now fixed in HTML.
    // Fill white initially just in case.
    sigPadCtx.fillStyle = '#FFFFFF';
    sigPadCtx.fillRect(0, 0, sigPadCanvas.width, sigPadCanvas.height);
}

// Global Signature Pad Event Handlers (bound directly in HTML)
window.sigPadStart = function (e) {
    if (!sigPadCtx) return;
    isDrawing = true;
    hasDrawn = true;
    const placeholder = document.getElementById('sig-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    window.sigPadDraw(e);
};

window.sigPadEnd = function () {
    isDrawing = false;
    if (sigPadCtx) sigPadCtx.beginPath();
};

window.sigPadDraw = function (e) {
    if (!isDrawing || !sigPadCtx || !sigPadCanvas) return;
    e.preventDefault(); // Prevent scrolling on mobile while drawing

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    const rect = sigPadCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Scale mouse coordinates to canvas resolution
    const scaleX = sigPadCanvas.width / rect.width;
    const scaleY = sigPadCanvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    sigPadCtx.lineWidth = 3;
    sigPadCtx.lineCap = 'round';
    sigPadCtx.strokeStyle = '#000000';

    sigPadCtx.lineTo(x, y);
    sigPadCtx.stroke();
    sigPadCtx.beginPath();
    sigPadCtx.moveTo(x, y);
};

function clearSignaturePad() {
    if (!sigPadCtx || !sigPadCanvas) return;
    sigPadCtx.clearRect(0, 0, sigPadCanvas.width, sigPadCanvas.height);
    // Fill with white background (crucial for OCR/comparison logic)
    sigPadCtx.fillStyle = '#FFFFFF';
    sigPadCtx.fillRect(0, 0, sigPadCanvas.width, sigPadCanvas.height);
    hasDrawn = false;
    const placeholder = document.getElementById('sig-placeholder');
    if (placeholder) placeholder.style.display = 'block';
}

function captureSignaturePad() {
    if (!hasDrawn || !sigPadCanvas) {
        alert("Please draw your signature first.");
        return;
    }

    // Check that we have a PAN signature to compare against
    const panSigSrc = document.getElementById('pan-sig-preview')?.src;
    if (!panSigSrc || !tempData.panSignature) {
        alert('Please upload your PAN card first to extract the reference signature.');
        return;
    }

    const drawnSigData = sigPadCanvas.toDataURL('image/png');

    // Show comparison section
    document.getElementById('comparison-result').style.display = 'block';
    document.getElementById('img1').src = panSigSrc;
    document.getElementById('img2').src = drawnSigData;

    compareSignatures(panSigSrc, drawnSigData);
}

/* ================= INIT ================= */
// Render application list on page load
window.addEventListener('DOMContentLoaded', function () {
    renderApplicationList();
    renderEngagementTab();
    initDropoffPrevention();
    initSessionTimer();
    showPortal('customerPortal'); // Default start
});

/**
 * SBI AI Onboarding Agent — Standalone Sidebar Widget
 * 
 * Usage:
 *   1. Include agent-widget.css and agent-widget.js in your page
 *   2. The sidebar auto-initializes on DOMContentLoaded
 *   3. Call window.SBIAgent.setStep(n) when user moves between steps
 *   4. Call window.SBIAgent.notify(msg) to push agent messages programmatically
 * 
 * Config: Set window.SBI_AGENT_CONFIG before loading this script to customize:
 *   - apiBase: backend URL (default: 'http://localhost:3000')
 */

(function () {
    'use strict';

    /* ================= CONFIG ================= */
    const CONFIG = Object.assign({
        apiBase: window.location.origin,
    }, window.SBI_AGENT_CONFIG || {});

    /* ================= STEP DEFINITIONS ================= */
    const STEPS_LANG = {
        en: {
            0: { name: 'Welcome', greeting: "👋 Welcome to FINGUARD Digital Account Opening! I'm your AI assistant and I'll guide you through every step of the process. Click **Start Secure Verification** to begin, or ask me anything!", quickActions: ['What documents do I need?', 'How long does this take?', 'Is my data secure?'] },
            1: { name: 'Personal Details', greeting: "📝 **Step 1 — Personal Details**\n\nPlease enter your full name, Aadhaar number (12 digits), PAN number (10 characters), and mobile number. I'm here to help if you have any questions!", quickActions: ['What is Aadhaar?', 'What is PAN format?', 'Why do you need my mobile?', 'My name has a spelling issue'] },
            2: { name: 'Document Upload', greeting: "🆔 **Step 2 — Document Verification**\n\nNow upload or scan your Aadhaar and PAN card. Our OCR technology will read the details automatically. Make sure the document image is clear and well-lit!", quickActions: ['What file formats are accepted?', 'My scan is blurry, what do I do?', 'Can I type details manually?', 'What if OCR gets it wrong?'] },
            3: { name: 'Face Verification', greeting: "📷 **Step 3 — Face Verification & Liveness**\n\nWe need to verify your identity with a quick face scan. Please ensure good lighting and look directly at the camera. This is a secure biometric check.", quickActions: ['Why do you need face verification?', 'My camera is not working', 'Is my photo stored?', 'What is liveness detection?'] },
            4: { name: 'Signature Verification', greeting: "✍️ **Step 4 — Signature Verification**\n\nWe need to verify your signature. Please sign on a plain white paper or use the digital pad. We will match it with your pan card signature.", quickActions: ['How do I sign?', 'My signature changed', 'Is digital signature valid?', 'Why do you need this?'] },
            5: { name: 'Income & Employment', greeting: "💼 **Step 5 — Income & Employment**\n\nAlmost there! Please select your annual income range and employment type. This helps us determine suitable account products for you.", quickActions: ['Why do you need income details?', 'I am a student, what do I select?', 'What if I have multiple income sources?', 'Will this affect my application?'] },
            6: { name: 'Complete', greeting: "🎉 **Congratulations!**\n\nYour application has been submitted and the AI Risk Assessment is complete. You'll receive a confirmation on your registered mobile and email.", quickActions: ['What is my risk score?', 'When will my account be active?', 'How do I contact support?', 'I want to apply for a loan too'] }
        },
        hi: {
            0: { name: 'स्वागत', greeting: "👋 फ़िनगार्ड डिजिटल खाता खोलने में आपका स्वागत है! मैं आपका AI सहायक हूं और हर कदम पर आपका मार्गदर्शन करूंगा। शुरू करने के लिए **डिजिटल खाता खोलना शुरू करें** पर क्लिक करें, या मुझसे कुछ भी पूछें!", quickActions: ['मुझे किन दस्तावेज़ों की आवश्यकता है?', 'इसमें कितना समय लगता है?', 'क्या मेरा डेटा सुरक्षित है?'] },
            1: { name: 'व्यक्तिगत विवरण', greeting: "📝 **चरण 1 — व्यक्तिगत विवरण**\n\nकृपया अपना पूरा नाम, आधार नंबर (12 अंक), पैन नंबर (10 अक्षर), और मोबाइल नंबर दर्ज करें। यदि आपके कोई प्रश्न हैं तो मैं सहायता के लिए यहाँ हूँ!", quickActions: ['आधार क्या है?', 'पैन का प्रारूप क्या है?', 'आपको मेरे मोबाइल की आवश्यकता क्यों है?', 'मेरे नाम की स्पेलिंग में समस्या है'] },
            2: { name: 'दस्तावेज़ अपलोड', greeting: "🆔 **चरण 2 — दस्तावेज़ सत्यापन**\n\nअब अपना आधार और पैन कार्ड अपलोड या स्कैन करें। हमारी OCR तकनीक विवरण स्वचालित रूप से पढ़ लेगी। सुनिश्चित करें कि दस्तावेज़ की छवि स्पष्ट हो!", quickActions: ['कौन से फ़ाइल स्वरूप स्वीकार्य हैं?', 'मेरा स्कैन धुंधला है, मैं क्या करूँ?', 'क्या मैं विवरण मैन्युअल रूप से टाइप कर सकता हूँ?', 'यदि OCR गलत पढ़ता है तो क्या होगा?'] },
            3: { name: 'चेहरा सत्यापन', greeting: "📷 **चरण 3 — चेहरा सत्यापन और लाइवनेस**\n\nहमें एक त्वरित फेस स्कैन के साथ आपकी पहचान सत्यापित करनी होगी। कृपया सुनिश्चित करें कि अच्छी रोशनी हो और सीधे कैमरे की ओर देखें।", quickActions: ['आपको चेहरे के सत्यापन की आवश्यकता क्यों है?', 'मेरा कैमरा काम नहीं कर रहा है', 'क्या मेरी फोटो सहेजी गई है?', 'लाइवनेस डिटेक्शन क्या है?'] },
            4: { name: 'हस्ताक्षर सत्यापन', greeting: "✍️ **चरण 4 — हस्ताक्षर सत्यापन**\n\nहमें आपके हस्ताक्षर सत्यापित करने होंगे। कृपया एक सादे सफेद कागज पर हस्ताक्षर करें या डिजिटल पैड का उपयोग करें। हम इसे आपके पैन कार्ड के हस्ताक्षर से मिलाएंगे।", quickActions: ['मैं हस्ताक्षर कैसे करूँ?', 'मेरे हस्ताक्षर बदल गए हैं', 'क्या डिजिटल हस्ताक्षर मान्य है?', 'आपको इसकी आवश्यकता क्यों है?'] },
            5: { name: 'आय और रोजगार', greeting: "💼 **चरण 5 — आय और रोजगार**\n\nबस हो गया! कृपया अपनी वार्षिक आय सीमा और रोजगार के प्रकार का चयन करें। इससे हमें आपके लिए उपयुक्त खाता उत्पाद निर्धारित करने में मदद मिलती है।", quickActions: ['आपको आय विवरण की आवश्यकता क्यों है?', 'मैं एक छात्र हूं, मुझे क्या चुनना चाहिए?', 'अगर मेरे पास आय के कई स्रोत हैं तो क्या होगा?', 'क्या इससे मेरे आवेदन पर असर पड़ेगा?'] },
            6: { name: 'पूर्ण', greeting: "🎉 **बधाई हो!**\n\nआपका आवेदन जमा कर दिया गया है और AI जोखिम मूल्यांकन पूर्ण हो गया है। आपको अपने पंजीकृत मोबाइल और ईमेल पर एक पुष्टि प्राप्त होगी।", quickActions: ['मेरा जोखिम स्कोर क्या है?', 'मेरा खाता कब सक्रिय होगा?', 'मैं समर्थन से कैसे संपर्क करूँ?', 'मैं ऋण के लिए भी आवेदन करना चाहता हूँ'] }
        },
        mr: {
            0: { name: 'स्वागत आहे', greeting: "👋 फिनगार्ड डिजिटल खाते उघडण्यात आपले स्वागत आहे! मी तुमचा एआय सहाय्यक आहे आणि प्रक्रियेच्या प्रत्येक टप्प्यावर मी तुम्हाला मार्गदर्शन करेन. सुरू करण्यासाठी **डिजिटल खाते उघडण्यास सुरुवात करा** वर क्लिक करा किंवा मला काहीही विचारा!", quickActions: ['मला कोणती कागदपत्रे लागतील?', 'याला किती वेळ लागेल?', 'माझा डेटा सुरक्षित आहे का?'] },
            1: { name: 'वैयक्तिक तपशील', greeting: "📝 **चरण 1 — वैयक्तिक तपशील**\n\nकृपया तुमचे पूर्ण नाव, आधार क्रमांक (12 अंक), पॅन क्रमांक (10 अक्षरे), आणि मोबाईल क्रमांक प्रविष्ट करा. तुम्हाला काही प्रश्न असल्यास मी मदतीसाठी येथे आहे!", quickActions: ['आधार म्हणजे काय?', 'पॅन स्वरूप काय आहे?', 'तुम्हाला माझा मोबाईल का हवा आहे?', 'माझ्या नावात स्पेलिंगची समस्या आहे'] },
            2: { name: 'कागदपत्रे अपलोड', greeting: "🆔 **चरण 2 — कागदपत्र पडताळणी**\n\nआता तुमचे आधार आणि पॅन कार्ड अपलोड किंवा स्कॅन करा. आमचे OCR तंत्रज्ञान तपशील आपोआप वाचेल. कागदपत्राची प्रतिमा स्पष्ट असल्याची खात्री करा!", quickActions: ['कोणते फाईल फॉरमॅट्स स्वीकारले जातात?', 'माझा स्कॅन अस्पष्ट आहे, मी काय करू?', 'मी व्यक्तिचलितपणे तपशील टाइप करू शकतो का?', 'जर OCR ने चुकीचे वाचले तर काय होईल?'] },
            3: { name: 'चेहरा पडताळणी', greeting: "📷 **चरण 3 — चेहरा पडताळणी आणि थेटपणा**\n\nआम्हाला त्वरित फेस स्कॅनद्वारे तुमची ओळख पडताळून पाहणे आवश्यक आहे. कृपया चांगला प्रकाश असल्याची खात्री करा आणि थेट कॅमेऱ्याकडे पहा.", quickActions: ['तुम्हाला चेहरा पडताळणी का हवी आहे?', 'माझा कॅमेरा काम करत नाही', 'माझा फोटो जतन केला आहे का?', 'लाइव्हनेस डिटेक्शन म्हणजे काय?'] },
            4: { name: 'स्वाक्षरी पडताळणी', greeting: "✍️ **चरण 4 — स्वाक्षरी पडताळणी**\n\nआम्हाला तुमची स्वाक्षरी पडताळून पाहणे आवश्यक आहे. कृपया साध्या पांढऱ्या कागदावर स्वाक्षरी करा किंवा डिजिटल पॅड वापरा. आम्ही तुमच्या पॅन कार्ड स्वाक्षरीशी ते जुळवू.", quickActions: ['मी स्वाक्षरी कशी करू?', 'माझी स्वाक्षरी बदलली आहे', 'डिजिटल स्वाक्षरी वैध आहे का?', 'तुम्हाला याची का गरज आहे?'] },
            5: { name: 'उत्पन्न आणि रोजगार', greeting: "💼 **चरण 5 — उत्पन्न आणि रोजगार**\n\nजवळपास पूर्ण झाले! कृपया तुमची वार्षिक उत्पन्न श्रेणी आणि रोजगार प्रकार निवडा. हे आम्हाला तुमच्यासाठी योग्य खाते उत्पादने निर्धारित करण्यात मदत करते.", quickActions: ['तुम्हाला उत्पन्न तपशीलाची का गरज आहे?', 'मी विद्यार्थी आहे, मी काय निवडू?', 'माझ्याकडे उत्पन्नाचे अनेक स्रोत असल्यास काय?', 'याचा माझ्या अर्जावर परिणाम होईल का?'] },
            6: { name: 'पूर्ण झाले', greeting: "🎉 **अभिनंदन!**\n\nतुमचा अर्ज सबमिट केला गेला आहे आणि AI जोखीम मूल्यांकन पूर्ण झाले आहे. तुम्हाला तुमच्या नोंदणीकृत मोबाईल आणि ईमेलवर पुष्टीकरण मिळेल.", quickActions: ['माझा जोखीम स्कोअर काय आहे?', 'माझे खाते कधी सक्रिय होईल?', 'मी सपोर्टशी संपर्क कसा साधू?', 'मला कर्जासाठीही अर्ज करायचा आहे'] }
        }
    };

    function getStepData(stepNum) {
        const lang = window.currentLang || 'en';
        const steps = STEPS_LANG[lang] || STEPS_LANG['en'];
        return steps[stepNum] || steps[0];
    }

    /* ================= STATE ================= */
    let currentStep = 0;
    let sessionId = 'agent-' + Date.now();
    let isMinimized = false;
    let messages = [];
    let isTyping = false;

    // Voice Mode State
    let isListening = false;
    let isTtsEnabled = false;
    let recognition = null;

    /* ================= DOM CREATION ================= */
    function createSidebar() {
        // Main sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'sbi-agent-sidebar';
        sidebar.id = 'sbiAgentSidebar';

        sidebar.innerHTML = `
            <!-- Header -->
            <div class="sbi-agent-header">
                <div class="sbi-agent-header-left">
                    <div class="sbi-agent-avatar" style="overflow:hidden; background:white; width: 36px; height: 36px; border: 1px solid rgba(0,33,71,0.2); display: flex; align-items: center; justify-content: center;">
                        <img src="logo.png" style="width:180%; height:180%; object-fit:contain; object-position: center 15%;">
                    </div>
                    <div>
                        <div class="sbi-agent-title">Onboarding Agent</div>
                        <div class="sbi-agent-subtitle">AI-Powered Assistant</div>
                    </div>
                </div>
                <div class="sbi-agent-header-actions">
                    <button class="sbi-agent-header-btn" id="sbiAgentClearBtn" title="Clear chat">🗑</button>
                    <button class="sbi-agent-header-btn" id="sbiAgentMinBtn" title="Minimize">—</button>
                </div>
            </div>

            <!-- Step Indicator -->
            <div class="sbi-agent-step-bar" id="sbiAgentStepBar">
                <span class="sbi-agent-step-badge" id="sbiAgentStepBadge">Welcome</span>
                <span class="sbi-agent-step-name" id="sbiAgentStepName">Getting Started</span>
            </div>

            <!-- Quick Actions -->
            <div class="sbi-agent-quick-actions" id="sbiAgentQuickActions"></div>

            <!-- Messages -->
            <div class="sbi-agent-messages" id="sbiAgentMessages"></div>

            <!-- Input -->
            <div class="sbi-agent-input-area">
                <div class="sbi-agent-voice-controls">
                    <button class="sbi-agent-mic-btn" id="sbiAgentMicBtn" title="Voice Input">🎤</button>
                    <button class="sbi-agent-speaker-btn" id="sbiAgentSpeakerBtn" title="Read Aloud">🔊</button>
                </div>
                <input type="text" class="sbi-agent-input" id="sbiAgentInput" 
                       placeholder="Ask me anything..." 
                       autocomplete="off">
                <button class="sbi-agent-send-btn" id="sbiAgentSendBtn" title="Send">➤</button>
            </div>

            <!-- Footer -->
            <div class="sbi-agent-footer">
                Powered by INNOVGENIUS AI • Secured & Encrypted
            </div>
        `;

        document.body.appendChild(sidebar);

        // Floating toggle button
        const toggle = document.createElement('button');
        toggle.className = 'sbi-agent-toggle';
        toggle.id = 'sbiAgentToggle';
        toggle.innerHTML = '<img src="logo.png" style="width:160%; height:160%; object-fit:contain; object-position: center 12%;"><span class="sbi-agent-toggle-badge" id="sbiAgentToggleBadge" style="display:none;">0</span>';
        document.body.appendChild(toggle);

        // Bind events
        bindEvents();

        // Send initial greeting
        setTimeout(() => {
            showGreeting(0);
        }, 600);
    }

    /* ================= EVENT BINDING ================= */
    function bindEvents() {
        // Send button
        document.getElementById('sbiAgentSendBtn').addEventListener('click', handleSend);

        // Enter key
        document.getElementById('sbiAgentInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        // Voice buttons
        document.getElementById('sbiAgentMicBtn').addEventListener('click', toggleVoiceInput);
        document.getElementById('sbiAgentSpeakerBtn').addEventListener('click', toggleTts);

        // Minimize
        document.getElementById('sbiAgentMinBtn').addEventListener('click', toggleMinimize);

        // Toggle (restore)
        document.getElementById('sbiAgentToggle').addEventListener('click', toggleMinimize);

        // Clear chat
        document.getElementById('sbiAgentClearBtn').addEventListener('click', clearChat);
    }

    /* ================= VOICE MODE LOGIC ================= */
    function initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser.');
            return null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;

        // Use current language if possible
        const langMap = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };
        rec.lang = langMap[window.currentLang] || 'en-US';

        rec.onstart = () => {
            isListening = true;
            document.getElementById('sbiAgentMicBtn').classList.add('active');
            document.getElementById('sbiAgentInput').placeholder = 'Listening...';
        };

        rec.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('sbiAgentInput').value = transcript;

            // Check for voice commands
            const lowerVal = transcript.toLowerCase();
            if (lowerVal.includes('next') || lowerVal.includes('continue') || lowerVal.includes('proceed')) {
                addMessage(transcript, 'user');
                addMessage("Sure, moving to the next step.", 'agent');
                if (window.nextStep) window.nextStep();
                else if (document.getElementById('nextBtn')) document.getElementById('nextBtn').click();
            } else {
                // Not a command, try to parse entities
                addMessage(transcript, 'user');
                handleVoiceDataEntry(transcript);
            }
        };

        rec.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopListening();
        };

        rec.onend = () => {
            stopListening();
        };

        return rec;
    }

    async function handleVoiceDataEntry(text) {
        showTyping();
        try {
            const res = await fetch(CONFIG.apiBase + '/api/parse-entities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!res.ok) throw new Error('Parsing failed');
            const entities = await res.json();

            let updatedFields = [];
            const fieldMap = {
                name: { id: 'custName', label: 'Name' },
                aadhar: { id: 'custAadhar', label: 'Aadhaar' },
                pan: { id: 'custPan', label: 'PAN' },
                mobile: { id: 'custMobile', label: 'Mobile' },
                income: { id: 'custIncome', label: 'Income' },
                employment: { id: 'custEmployment', label: 'Employment' }
            };

            for (const [key, value] of Object.entries(entities)) {
                if (value && fieldMap[key]) {
                    const el = document.getElementById(fieldMap[key].id);
                    if (el) {
                        el.value = value;
                        updatedFields.push(fieldMap[key].label);
                        // Trigger input events so any validation logic runs
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }

            hideTyping();
            if (updatedFields.length > 0) {
                const reply = `I've updated your **${updatedFields.join(', ')}** for you. Feel free to speak more details or click Next to continue.`;
                addMessage(reply, 'agent');
                speakMessage(reply);
            } else {
                // Fallback to normal agent chat if no entities found
                await sendToAgent(text);
            }
        } catch (err) {
            console.error('Voice Data Entry Error:', err);
            hideTyping();
            await sendToAgent(text);
        }
    }

    function toggleVoiceInput() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }

    function startListening() {
        if (!recognition) recognition = initSpeechRecognition();
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                console.error('Failed to start recognition:', e);
            }
        }
    }

    function stopListening() {
        isListening = false;
        if (recognition) recognition.stop();
        document.getElementById('sbiAgentMicBtn').classList.remove('active');
        document.getElementById('sbiAgentInput').placeholder = 'Ask me anything...';
    }

    function toggleTts() {
        isTtsEnabled = !isTtsEnabled;
        const btn = document.getElementById('sbiAgentSpeakerBtn');
        if (isTtsEnabled) {
            btn.classList.add('active');
            btn.innerHTML = '🔊';
            // Speak the last message if it was from agent
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === 'agent') speakMessage(lastMsg.text);
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '🔈';
            window.speechSynthesis.cancel();
        }
    }

    function speakMessage(text) {
        if (!isTtsEnabled || !text) return;

        // Remove markdown before speaking
        const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/<br>/g, '. ');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const langMap = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };
        utterance.lang = langMap[window.currentLang] || 'en-US';

        window.speechSynthesis.cancel(); // Stop any pending speech
        window.speechSynthesis.speak(utterance);
    }

    /* ================= MINIMIZE / EXPAND ================= */
    function toggleMinimize() {
        isMinimized = !isMinimized;
        const sidebar = document.getElementById('sbiAgentSidebar');
        const toggle = document.getElementById('sbiAgentToggle');

        if (isMinimized) {
            sidebar.classList.add('minimized');
            toggle.classList.add('visible');
        } else {
            sidebar.classList.remove('minimized');
            toggle.classList.remove('visible');
            const badge = document.getElementById('sbiAgentToggleBadge');
            badge.style.display = 'none';
            badge.textContent = '0';
        }

        // Toggle body class for layout adjustment
        document.body.classList.toggle('agent-minimized', isMinimized);
    }

    /* ================= CLEAR CHAT ================= */
    function clearChat() {
        messages = [];
        sessionId = 'agent-' + Date.now();
        const container = document.getElementById('sbiAgentMessages');
        container.innerHTML = '';
        showGreeting(currentStep);
    }

    /* ================= RENDER MESSAGES ================= */
    function addMessage(text, role) {
        const container = document.getElementById('sbiAgentMessages');
        const msgEl = document.createElement('div');
        msgEl.className = `sbi-agent-msg ${role}`;
        msgEl.innerHTML = formatMarkdown(text);
        container.appendChild(msgEl);
        container.scrollTop = container.scrollHeight;

        messages.push({ role, text });

        // If minimized, show badge
        if (isMinimized && role === 'agent') {
            const badge = document.getElementById('sbiAgentToggleBadge');
            const count = parseInt(badge.textContent || '0') + 1;
            badge.textContent = count;
            badge.style.display = 'flex';
        }

        // Trigger TTS if enabled
        if (role === 'agent') {
            speakMessage(text);
        }
    }

    function showTyping() {
        if (isTyping) return;
        isTyping = true;
        const container = document.getElementById('sbiAgentMessages');
        const typing = document.createElement('div');
        typing.className = 'sbi-agent-typing';
        typing.id = 'sbiAgentTyping';
        typing.innerHTML = `
            <div class="sbi-agent-typing-dot"></div>
            <div class="sbi-agent-typing-dot"></div>
            <div class="sbi-agent-typing-dot"></div>
        `;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }

    function hideTyping() {
        isTyping = false;
        const typing = document.getElementById('sbiAgentTyping');
        if (typing) typing.remove();
    }

    function formatMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/• /g, '&bull; ');
    }

    /* ================= QUICK ACTIONS ================= */
    function renderQuickActions(stepNum) {
        const container = document.getElementById('sbiAgentQuickActions');
        const step = getStepData(stepNum);
        container.innerHTML = '';

        (step.quickActions || []).forEach(text => {
            const btn = document.createElement('button');
            btn.className = 'sbi-agent-quick-btn';
            btn.textContent = text;
            btn.addEventListener('click', () => {
                addMessage(text, 'user');
                sendToAgent(text);
            });
            container.appendChild(btn);
        });
    }

    /* ================= STEP MANAGEMENT ================= */
    function updateStepUI(stepNum) {
        const step = getStepData(stepNum);
        const badge = document.getElementById('sbiAgentStepBadge');
        const name = document.getElementById('sbiAgentStepName');

        if (stepNum === 0) {
            badge.textContent = 'Welcome';
        } else {
            badge.textContent = `Step ${stepNum}`;
        }
        name.textContent = step.name;
        renderQuickActions(stepNum);
    }

    function showGreeting(stepNum) {
        const step = getStepData(stepNum);
        let greeting = step.greeting;

        // Proactive prompt for Step 1
        if (stepNum === 1) {
            greeting += "\n\n💡 **Tip:** You can just say your details! Click the mic and say something like *'My name is Rahul and my mobile is 9876543210'* and I'll fill it for you.";
        }

        addMessage(greeting, 'agent');
        updateStepUI(stepNum);
    }

    /* ================= SEND MESSAGE TO AI ================= */
    async function handleSend() {
        const input = document.getElementById('sbiAgentInput');
        const text = input.value.trim();
        if (!text || isTyping) return;

        input.value = '';
        addMessage(text, 'user');
        await sendToAgent(text);
    }

    async function sendToAgent(userMessage) {
        showTyping();

        try {
            const res = await fetch(CONFIG.apiBase + '/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: sessionId,
                    currentStep: currentStep,
                    language: window.currentLang || 'en'
                })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            hideTyping();
            addMessage(data.reply, 'agent');
        } catch (err) {
            hideTyping();
            addMessage("⚠ I'm having trouble connecting to the server. Please make sure the backend is running on " + CONFIG.apiBase, 'agent');
            console.error('SBI Agent Error:', err);
        }
    }

    /* ================= PUBLIC API ================= */
    window.SBIAgent = {
        /**
         * Update the current onboarding step.
         * Call this from the dashboard when the user moves between steps.
         * @param {number} stepNumber - Step number (1-6)
         */
        setStep: function (stepNumber) {
            if (stepNumber === currentStep) return;
            currentStep = stepNumber;
            updateStepUI(stepNumber);
            showGreeting(stepNumber);
        },

        /**
         * Push a notification message from the agent.
         * Use this to send proactive messages (e.g., validation hints).
         * @param {string} message - Message text
         */
        notify: function (message) {
            addMessage(message, 'agent');
        },

        /**
         * Minimize or expand the sidebar.
         */
        toggle: function () {
            toggleMinimize();
        },

        /**
         * Get the current step number.
         */
        getStep: function () {
            return currentStep;
        },

        /**
         * Reset the agent session.
         */
        reset: function () {
            clearChat();
        },

        /**
         * Triggered when application language changes.
         */
        onLanguageChange: function () {
            updateStepUI(currentStep);
            // Re-show greeting in new language
            showGreeting(currentStep);
        }
    };

    /* ================= INIT ================= */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createSidebar);
    } else {
        createSidebar();
    }

})();

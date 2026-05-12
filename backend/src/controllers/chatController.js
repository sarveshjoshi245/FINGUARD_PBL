/**
 * Chat/AI Controller
 * Handles Groq AI integration for onboarding and admin chat
 */

const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

// Lazy-load Groq client on first use
let groqClient = null;

function getGroqClient() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    try {
      const Groq = require('groq-sdk');
      groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    } catch (error) {
      console.warn('⚠️  Groq client initialization warning:', error.message);
    }
  }
  return groqClient;
}

// Session storage for onboarding conversations
const sessions = {};

/**
 * Get or create session for onboarding
 */
function getSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(),
        },
      ],
      data: {},
      step: 0,
    };
  }
  return sessions[sessionId];
}

/**
 * Build system prompt from YAML config
 */
function buildSystemPrompt() {
  try {
    const yamlPath = path.join(__dirname, '../agent/sbi_onboarding_agent.yaml');
    if (fs.existsSync(yamlPath)) {
      const yamlContent = fs.readFileSync(yamlPath, 'utf8');
      const config = YAML.parse(yamlContent);
      return config.systemPrompt || 'You are a helpful onboarding assistant.';
    }
  } catch (error) {
    console.warn('⚠️  Could not load system prompt:', error.message);
  }
  return 'You are a helpful onboarding assistant for banking services.';
}

/**
 * POST /api/chat
 * Admin chat endpoint for questions about onboarding/compliance
 */
exports.adminChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const groqClient = getGroqClient();
    if (!groqClient) {
      return res.status(500).json({
        success: false,
        error: 'Groq not configured. Check your API key.',
      });
    }

    const messages = [
      {
        role: 'system',
        content: buildSystemPrompt() +
          '\n\nYou are now in the Admin chat. Help the admin with questions about the onboarding process, risk scoring, compliance, and customer applications. Be professional and concise.',
      },
      ...history.map(h => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await groqClient.chat.completions.create({
      model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
      messages: messages,
      max_tokens: 500,
      temperature: parseFloat(process.env.TEMPERATURE || 0.7),
    });

    const reply = completion.choices[0].message.content;

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({
      success: false,
      error: 'AI service error: ' + error.message,
    });
  }
};

/**
 * POST /api/onboarding
 * Handle onboarding step with AI assistance
 */
exports.onboardingChat = async (req, res) => {
  try {
    const { sessionId, userMessage, stepData } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required',
      });
    }

    const groqClient = getGroqClient();
    if (!groqClient) {
      return res.status(500).json({
        success: false,
        error: 'Groq not configured.',
      });
    }

    const session = getSession(sessionId);

    if (stepData) {
      Object.assign(session.data, stepData);
    }

    let contextMsg = userMessage || '';
    if (stepData) {
      contextMsg += `\n\nCustomer data collected so far: ${JSON.stringify(session.data)}`;
    }

    if (contextMsg) {
      session.messages.push({ role: 'user', content: contextMsg });
    }

    const completion = await groqClient.chat.completions.create({
      model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
      messages: session.messages,
      max_tokens: 600,
      temperature: parseFloat(process.env.TEMPERATURE || 0.7),
    });

    const reply = completion.choices[0].message.content;
    session.messages.push({ role: 'assistant', content: reply });
    session.step++;

    res.json({
      success: true,
      reply,
      step: session.step,
      sessionId,
    });
  } catch (error) {
    console.error('❌ Onboarding error:', error.message);
    res.status(500).json({
      success: false,
      error: 'AI service error: ' + error.message,
    });
  }
};

/**
 * POST /api/onboarding/reset
 * Reset onboarding session
 */
exports.resetOnboarding = (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId && sessions[sessionId]) {
      delete sessions[sessionId];
    }

    res.json({
      success: true,
      message: 'Session reset',
    });
  } catch (error) {
    console.error('❌ Reset onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset session',
    });
  }
};

/**
 * GET /api/onboarding/session/:sessionId
 * Get session status
 */
exports.getSessionStatus = (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || !sessions[sessionId]) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    const session = sessions[sessionId];

    res.json({
      success: true,
      data: {
        step: session.step,
        dataCollected: Object.keys(session.data).length,
        messageCount: session.messages.length,
      },
    });
  } catch (error) {
    console.error('❌ Get session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session',
    });
  }
};

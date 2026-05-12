/**
 * AI/Groq Configuration
 * Central point for AI service settings
 */

module.exports = {
  // Groq API
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
  GROQ_TIMEOUT: 30000, // 30 seconds
  
  // AI Agent Configuration
  AGENT_NAME: 'SBI_Onboarding_Agent',
  AGENT_CONFIG_PATH: './sbi_onboarding_agent.yaml',
  
  // LLM Settings
  TEMPERATURE: 0.7,
  MAX_TOKENS: 1024,
  TOP_P: 1.0,
  
  // Thresholds
  CONFIDENCE_THRESHOLD: 0.6,
  MIN_FACE_CONFIDENCE: 0.7,
  
  // Timeouts
  OCR_TIMEOUT: 60000, // 60 seconds
  FACE_DETECTION_TIMEOUT: 30000, // 30 seconds
};
/**
 * AI/Groq Configuration
 * Central point for AI service settings
 */

module.exports = {
  // Groq API
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
  GROQ_TIMEOUT: 30000, // 30 seconds
  
  // AI Agent Configuration
  AGENT_NAME: 'SBI_Onboarding_Agent',
  AGENT_CONFIG_PATH: './sbi_onboarding_agent.yaml',
  
  // LLM Settings
  TEMPERATURE: 0.7,
  MAX_TOKENS: 1024,
  TOP_P: 1.0,
  
  // Thresholds
  CONFIDENCE_THRESHOLD: 0.6,
  MIN_FACE_CONFIDENCE: 0.7,
  
  // Timeouts
  OCR_TIMEOUT: 60000, // 60 seconds
  FACE_DETECTION_TIMEOUT: 30000, // 30 seconds
};

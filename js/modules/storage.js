/**
 * LocalStorage wrapper for managing application data
 * Handles API keys, prompts, and session history
 */

const STORAGE_KEYS = {
  API_KEY: 'gemini_api_key',
  SYSTEM_PROMPT: 'system_prompt',
  MODEL_TRANSCRIPTION: 'model_transcription',
  MODEL_SOAP: 'model_soap',
  CURRENT_SESSION: 'current_session',
  SESSION_HISTORY: 'session_history'
};

// Default system prompt for SOAP generation
const DEFAULT_SYSTEM_PROMPT = `You are a veterinary medical assistant. Convert the following veterinary consultation transcript into a structured SOAP note format.

SOAP Format:
- **Subjective**: Patient history, owner concerns, symptoms reported
- **Objective**: Physical exam findings, vital signs, observable data
- **Assessment**: Diagnosis or differential diagnoses
- **Plan**: Treatment plan, medications, follow-up instructions

Format your response in clean Markdown with clear section headers. Be concise but thorough. Use professional veterinary terminology.`;

export const Storage = {
  // API Key management
  getApiKey() {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  setApiKey(key) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },

  hasApiKey() {
    const key = this.getApiKey();
    return key && key.length > 0;
  },

  clearApiKey() {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  // System prompt management
  getSystemPrompt() {
    return localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || DEFAULT_SYSTEM_PROMPT;
  },

  setSystemPrompt(prompt) {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, prompt);
  },

  resetSystemPrompt() {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, DEFAULT_SYSTEM_PROMPT);
  },

  // Model selection
  getTranscriptionModel() {
    return localStorage.getItem(STORAGE_KEYS.MODEL_TRANSCRIPTION) || 'gemini-2.5-flash';
  },

  setTranscriptionModel(model) {
    localStorage.setItem(STORAGE_KEYS.MODEL_TRANSCRIPTION, model);
  },

  getSOAPModel() {
    return localStorage.getItem(STORAGE_KEYS.MODEL_SOAP) || 'gemini-2.5-pro';
  },

  setSOAPModel(model) {
    localStorage.setItem(STORAGE_KEYS.MODEL_SOAP, model);
  },

  // Current session management (auto-save recovery)
  getCurrentSession() {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return data ? JSON.parse(data) : null;
  },

  setCurrentSession(sessionData) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(sessionData));
  },

  clearCurrentSession() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  },

  // Session history management
  getSessionHistory() {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  addSessionToHistory(session) {
    const history = this.getSessionHistory();
    const sessionWithTimestamp = {
      ...session,
      timestamp: new Date().toISOString()
    };

    // Keep last 50 sessions
    history.unshift(sessionWithTimestamp);
    if (history.length > 50) {
      history.pop();
    }

    localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(history));
  },

  clearSessionHistory() {
    localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
  },

  // Clear all application data
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

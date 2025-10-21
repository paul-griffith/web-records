/**
 * LocalStorage wrapper for managing application data
 * Handles API keys, prompts, and session history
 */

import { Session, StorageKeys } from '../types';

const STORAGE_KEYS: StorageKeys = {
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
  getApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },

  hasApiKey(): boolean {
    const key = this.getApiKey();
    return key.length > 0;
  },

  clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  // System prompt management
  getSystemPrompt(): string {
    return localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || DEFAULT_SYSTEM_PROMPT;
  },

  setSystemPrompt(prompt: string): void {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, prompt);
  },

  resetSystemPrompt(): void {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, DEFAULT_SYSTEM_PROMPT);
  },

  getDefaultSystemPrompt(): string {
    return DEFAULT_SYSTEM_PROMPT;
  },

  // Model selection
  getTranscriptionModel(): string {
    return localStorage.getItem(STORAGE_KEYS.MODEL_TRANSCRIPTION) || 'gemini-2.5-flash';
  },

  setTranscriptionModel(model: string): void {
    localStorage.setItem(STORAGE_KEYS.MODEL_TRANSCRIPTION, model);
  },

  getSOAPModel(): string {
    return localStorage.getItem(STORAGE_KEYS.MODEL_SOAP) || 'gemini-2.5-pro';
  },

  setSOAPModel(model: string): void {
    localStorage.setItem(STORAGE_KEYS.MODEL_SOAP, model);
  },

  // Current session management (auto-save recovery)
  getCurrentSession(): Session | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return data ? JSON.parse(data) : null;
  },

  setCurrentSession(sessionData: Session): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(sessionData));
  },

  clearCurrentSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  },

  // Session history management
  getSessionHistory(): Session[] {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  addSessionToHistory(session: Session): void {
    const history = this.getSessionHistory();
    const sessionWithTimestamp: Session = {
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

  clearSessionHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
  },

  // Clear all application data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

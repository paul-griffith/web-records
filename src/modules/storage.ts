import {StorageKeys} from '../types';

const STORAGE_KEYS: StorageKeys = {
  API_KEY: 'gemini_api_key',
};

// Default system prompt for SOAP generation
export const Storage = {
  // API Key management
  getApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },

  // Clear all application data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

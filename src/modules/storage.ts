import {StorageKeys} from '../types';

const STORAGE_KEYS: StorageKeys = {
  API_KEY: 'gemini_api_key',
  SELECTED_TEMPLATE: 'selected_template',
};

export const Storage = {
  getApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },

  getSelectedTemplate(): string {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_TEMPLATE) || 'none';
  },

  setSelectedTemplate(templateId: string): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_TEMPLATE, templateId);
  },

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

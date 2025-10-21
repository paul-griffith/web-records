/**
 * Settings modal component
 */

import { useState, useEffect } from 'preact/hooks';
import type { JSX } from 'preact';
import { Button } from './shared/Button';
import { Storage } from '../modules/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, model: string, systemPrompt: string) => void;
  onTestApiKey: (apiKey: string) => Promise<boolean>;
}

export function SettingsModal({
  isOpen,
  onClose,
  onSave,
  onTestApiKey
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setApiKey(Storage.getApiKey());
      setModel(Storage.getSOAPModel());
      setSystemPrompt(Storage.getSystemPrompt());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return <div id="settings-modal" className="modal hidden"></div>;
  }

  const handleApiKeyChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    setApiKey(e.currentTarget.value);
    setTestResult(null);
  };

  const handleModelChange = (e: JSX.TargetedEvent<HTMLSelectElement>) => {
    setModel(e.currentTarget.value);
  };

  const handleSystemPromptChange = (e: JSX.TargetedEvent<HTMLTextAreaElement>) => {
    setSystemPrompt(e.currentTarget.value);
  };

  const handleTestApiKey = async () => {
    const isValid = await onTestApiKey(apiKey);
    setTestResult(isValid ? 'API key is valid!' : 'API key test failed');
  };

  const handleResetPrompt = () => {
    setSystemPrompt(Storage.getDefaultSystemPrompt());
  };

  const handleClearSession = () => {
    if (confirm('Clear the current session? This cannot be undone.')) {
      Storage.clearCurrentSession();
      window.location.reload();
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear ALL data including API key and settings? This cannot be undone.')) {
      Storage.clearAllData();
      window.location.reload();
    }
  };

  const handleSave = () => {
    onSave(apiKey, model, systemPrompt);
    onClose();
  };

  return (
    <div id="settings-modal" className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Settings</h2>
          <button
            id="close-settings-btn"
            className="btn-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* API Key */}
          <div className="form-group">
            <label htmlFor="api-key-input">Gemini API Key</label>
            <div className="input-with-button">
              <input
                type="password"
                id="api-key-input"
                className="input-field"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onInput={handleApiKeyChange}
              />
              <Button
                className="btn btn-small"
                onClick={handleTestApiKey}
              >
                Test
              </Button>
            </div>
            {testResult && (
              <p className={`help-text ${testResult.includes('valid') ? 'success' : 'error'}`}>
                {testResult}
              </p>
            )}
            <p className="help-text">
              Get your API key from{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Model Selection */}
          <div className="form-group">
            <label htmlFor="model-select">Model</label>
            <select
              id="model-select"
              className="input-field"
              value={model}
              onChange={handleModelChange}
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (More expensive, "smarter")</option>
            </select>
          </div>

          {/* System Prompt */}
          <div className="form-group">
            <label htmlFor="system-prompt-input">System Prompt for SOAP Generation</label>
            <textarea
              id="system-prompt-input"
              className="input-field"
              rows={8}
              value={systemPrompt}
              onInput={handleSystemPromptChange}
            />
            <Button
              className="btn btn-small"
              onClick={handleResetPrompt}
            >
              Reset to Default
            </Button>
          </div>

          {/* Data Management */}
          <div className="form-group">
            <label>Data Management</label>
            <Button
              className="btn btn-danger btn-small"
              onClick={handleClearSession}
            >
              Clear Current Session
            </Button>
            {' '}
            <Button
              className="btn btn-danger btn-small"
              onClick={handleClearAll}
            >
              Clear All Data
            </Button>
          </div>
        </div>

        <div className="modal-footer">
          <Button
            className="btn btn-primary"
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

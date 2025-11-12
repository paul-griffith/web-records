/**
 * Settings modal component
 */

import { useState, useEffect } from 'preact/hooks';
import { TargetedEvent } from 'preact';
import { Button } from './shared/Button';
import { Storage } from '../modules/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  onTestApiKey: (apiKey: string) => Promise<boolean>;
}

export function SettingsModal({
  isOpen,
  onClose,
  onSave,
  onTestApiKey
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setApiKey(Storage.getApiKey());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return <div id="settings-modal" className="modal hidden"></div>;
  }

  const handleApiKeyChange = (e: TargetedEvent<HTMLInputElement>) => {
    setApiKey(e.currentTarget.value);
    setTestResult(null);
  };

  const handleTestApiKey = async () => {
    const isValid = await onTestApiKey(apiKey);
    setTestResult(isValid ? 'API key is valid!' : 'API key test failed');
  };

  const handleSave = () => {
    onSave(apiKey);
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

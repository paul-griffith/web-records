/**
 * Main application controller
 * Ties together all modules and manages UI state
 */

import { Storage } from './modules/storage.js';
import { AudioRecorder } from './modules/audio-recorder.js';
import { GeminiClient } from './modules/gemini-client.js';
import { renderMarkdown, htmlToPlainText } from './utils/markdown-renderer.js';
import { copyHTMLToClipboard } from './utils/clipboard.js';
import { RichTextEditor } from './utils/rich-text-editor.js';

// Application state
const AppState = {
  IDLE: 'idle',
  RECORDING: 'recording',
  TRANSCRIBING: 'transcribing',
  TRANSCRIPT_READY: 'transcript_ready',
  GENERATING_SOAP: 'generating_soap',
  SOAP_READY: 'soap_ready'
};

class App {
  constructor() {
    this.state = AppState.IDLE;
    this.recorder = null;
    this.geminiClient = null;
    this.richTextEditor = null;
    this.currentAudioData = null;
    this.currentTranscript = '';
    this.currentSOAP = '';

    // DOM elements
    this.elements = {};

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    // Cache DOM elements
    this.cacheElements();

    // Attach event listeners
    this.attachEventListeners();

    // Check for API key and initialize if available
    if (Storage.hasApiKey()) {
      try {
        this.geminiClient = new GeminiClient(Storage.getApiKey());
      } catch (error) {
        this.showAlert('error', 'Failed to initialize Gemini client. Please check your API key in settings.');
      }
    } else {
      // Show settings if no API key
      this.showAlert('info', 'Please configure your Gemini API key in settings to get started.');
    }

    // Check for browser compatibility
    if (!AudioRecorder.isSupported()) {
      this.showAlert('error', 'Audio recording is not supported in this browser. Please use Chrome or Firefox.');
      this.elements.startRecordingBtn.disabled = true;
    }

    // Initialize rich text editor for SOAP notes
    this.initializeRichTextEditor();

    // Load any saved session
    this.loadSavedSession();
  }

  /**
   * Initialize rich text editor
   */
  initializeRichTextEditor() {
    if (this.elements.soapEditor && this.elements.soapToolbar) {
      this.richTextEditor = new RichTextEditor(
        this.elements.soapEditor,
        this.elements.soapToolbar,
        this.elements.editorStats
      );
    }
  }

  /**
   * Cache all DOM elements
   */
  cacheElements() {
    // Buttons
    this.elements.settingsBtn = document.getElementById('settings-btn');
    this.elements.startRecordingBtn = document.getElementById('start-recording-btn');
    this.elements.stopRecordingBtn = document.getElementById('stop-recording-btn');
    this.elements.rerecordBtn = document.getElementById('rerecord-btn');
    this.elements.generateSOAPBtn = document.getElementById('generate-soap-btn');
    this.elements.regenerateSOAPBtn = document.getElementById('regenerate-soap-btn');
    this.elements.copySOAPBtn = document.getElementById('copy-soap-btn');
    this.elements.saveSOAPBtn = document.getElementById('save-soap-btn');

    // Sections
    this.elements.stepRecording = document.getElementById('step-recording');
    this.elements.stepTranscript = document.getElementById('step-transcript');
    this.elements.stepSOAP = document.getElementById('step-soap');

    // Recording
    this.elements.recordingStatus = document.getElementById('recording-status');
    this.elements.recordingTimer = document.getElementById('recording-timer');
    this.elements.recordingInfo = document.getElementById('recording-info');

    // Transcript
    this.elements.transcriptLoading = document.getElementById('transcript-loading');
    this.elements.transcriptContent = document.getElementById('transcript-content');
    this.elements.transcriptText = document.getElementById('transcript-text');

    // SOAP
    this.elements.soapLoading = document.getElementById('soap-loading');
    this.elements.soapContent = document.getElementById('soap-content');
    this.elements.soapEditor = document.getElementById('soap-editor');
    this.elements.soapToolbar = document.getElementById('soap-toolbar');
    this.elements.editorStats = document.querySelector('.editor-stats');

    // Alert
    this.elements.alertContainer = document.getElementById('alert-container');

    // Settings modal
    this.elements.settingsModal = document.getElementById('settings-modal');
    this.elements.closeSettingsBtn = document.getElementById('close-settings-btn');
    this.elements.apiKeyInput = document.getElementById('api-key-input');
    this.elements.testApiKeyBtn = document.getElementById('test-api-key-btn');
    this.elements.modelSelect = document.getElementById('model-select');
    this.elements.systemPromptInput = document.getElementById('system-prompt-input');
    this.elements.resetPromptBtn = document.getElementById('reset-prompt-btn');
    this.elements.clearSessionBtn = document.getElementById('clear-session-btn');
    this.elements.clearAllBtn = document.getElementById('clear-all-btn');
    this.elements.saveSettingsBtn = document.getElementById('save-settings-btn');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Recording controls
    this.elements.startRecordingBtn.addEventListener('click', () => this.startRecording());
    this.elements.stopRecordingBtn.addEventListener('click', () => this.stopRecording());
    this.elements.rerecordBtn.addEventListener('click', () => this.rerecord());

    // Transcript
    this.elements.generateSOAPBtn.addEventListener('click', () => this.generateSOAP());
    this.elements.transcriptText.addEventListener('input', () => this.autoSaveSession());

    // SOAP
    this.elements.regenerateSOAPBtn.addEventListener('click', () => this.regenerateSOAP());
    this.elements.copySOAPBtn.addEventListener('click', () => this.copySOAP());
    this.elements.saveSOAPBtn.addEventListener('click', () => this.saveSOAP());
    this.elements.soapEditor.addEventListener('input', () => this.autoSaveSession());

    // Settings
    this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
    this.elements.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    this.elements.testApiKeyBtn.addEventListener('click', () => this.testApiKey());
    this.elements.resetPromptBtn.addEventListener('click', () => this.resetPrompt());
    this.elements.clearSessionBtn.addEventListener('click', () => this.clearSession());
    this.elements.clearAllBtn.addEventListener('click', () => this.clearAllData());
    this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

    // Close modal on background click
    this.elements.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.elements.settingsModal) {
        this.closeSettings();
      }
    });
  }

  /**
   * Start audio recording
   */
  async startRecording() {
    if (!Storage.hasApiKey()) {
      this.showAlert('error', 'Please configure your API key in settings before recording.');
      this.openSettings();
      return;
    }

    try {
      // Initialize recorder
      this.recorder = new AudioRecorder();
      await this.recorder.initialize();

      // Start recording
      this.recorder.start((elapsed) => {
        this.updateTimer(elapsed);
      });

      this.setState(AppState.RECORDING);
      this.showAlert('info', 'Recording in progress. Speak clearly into your microphone.');
    } catch (error) {
      this.showAlert('error', error.message);
      this.setState(AppState.IDLE);
    }
  }

  /**
   * Stop audio recording and transcribe
   */
  async stopRecording() {
    if (!this.recorder) return;

    try {
      // Stop recording
      const audioData = await this.recorder.stop();
      this.currentAudioData = audioData;

      // Clean up recorder
      this.recorder.cleanup();
      this.recorder = null;

      // Show transcript section
      this.elements.stepTranscript.classList.remove('hidden');
      this.setState(AppState.TRANSCRIBING);

      // Transcribe audio
      await this.transcribeAudio(audioData);
    } catch (error) {
      this.showAlert('error', `Failed to stop recording: ${error.message}`);
      this.setState(AppState.IDLE);
    }
  }

  /**
   * Transcribe audio using Gemini
   */
  async transcribeAudio(audioData) {
    this.elements.transcriptLoading.classList.remove('hidden');
    this.elements.transcriptContent.classList.add('hidden');

    try {
      const model = Storage.getTranscriptionModel();
      const transcript = await this.geminiClient.transcribeAudio(
        audioData.blob,
        audioData.mimeType,
        model
      );

      this.currentTranscript = transcript;
      this.elements.transcriptText.value = transcript;

      this.elements.transcriptLoading.classList.add('hidden');
      this.elements.transcriptContent.classList.remove('hidden');
      this.setState(AppState.TRANSCRIPT_READY);

      this.autoSaveSession();
      this.showAlert('success', 'Transcription complete! Review and edit as needed.');
    } catch (error) {
      this.elements.transcriptLoading.classList.add('hidden');
      this.showAlert('error', error.message);
      this.setState(AppState.IDLE);
    }
  }

  /**
   * Generate SOAP note from transcript
   */
  async generateSOAP() {
    const transcript = this.elements.transcriptText.value.trim();

    if (!transcript) {
      this.showAlert('error', 'Please provide a transcript before generating SOAP note.');
      return;
    }

    this.currentTranscript = transcript;
    this.elements.stepSOAP.classList.remove('hidden');
    this.setState(AppState.GENERATING_SOAP);

    this.elements.soapLoading.classList.remove('hidden');
    this.elements.soapContent.classList.add('hidden');

    try {
      const systemPrompt = Storage.getSystemPrompt();
      const model = Storage.getSOAPModel();

      const soapMarkdown = await this.geminiClient.generateSOAP(
        transcript,
        systemPrompt,
        model
      );

      this.currentSOAP = soapMarkdown;
      const soapHTML = renderMarkdown(soapMarkdown);

      // Set HTML and update stats if rich text editor is available
      if (this.richTextEditor) {
        this.richTextEditor.setHTML(soapHTML);
      } else {
        this.elements.soapEditor.innerHTML = soapHTML;
      }

      this.elements.soapLoading.classList.add('hidden');
      this.elements.soapContent.classList.remove('hidden');
      this.setState(AppState.SOAP_READY);

      this.autoSaveSession();
      this.showAlert('success', 'SOAP note generated! Review and edit as needed.');
    } catch (error) {
      this.elements.soapLoading.classList.add('hidden');
      this.showAlert('error', error.message);
      this.setState(AppState.TRANSCRIPT_READY);
    }
  }

  /**
   * Regenerate SOAP note
   */
  async regenerateSOAP() {
    await this.generateSOAP();
  }

  /**
   * Copy SOAP note to clipboard
   */
  async copySOAP() {
    // Get HTML content
    const html = this.richTextEditor ? this.richTextEditor.getHTML() : this.elements.soapEditor.innerHTML;
    const plainText = htmlToPlainText(html);

    const success = await copyHTMLToClipboard(html, plainText);

    if (success) {
      this.showAlert('success', 'SOAP note copied to clipboard! You can now paste it into your EMR.');
    } else {
      this.showAlert('error', 'Failed to copy to clipboard. Please select and copy manually.');
    }
  }

  /**
   * Save SOAP note to history
   */
  saveSOAP() {
    const session = {
      transcript: this.currentTranscript,
      soap: this.currentSOAP,
      soapHTML: this.elements.soapEditor.innerHTML
    };

    Storage.addSessionToHistory(session);
    this.showAlert('success', 'SOAP note saved to history.');
  }

  /**
   * Reset to record new consultation
   */
  rerecord() {
    if (confirm('This will clear the current session. Are you sure?')) {
      this.clearSession();
    }
  }

  /**
   * Clear current session
   */
  clearSession() {
    this.currentAudioData = null;
    this.currentTranscript = '';
    this.currentSOAP = '';

    this.elements.transcriptText.value = '';

    // Clear editor using rich text editor if available
    if (this.richTextEditor) {
      this.richTextEditor.clear();
    } else {
      this.elements.soapEditor.innerHTML = '';
    }

    this.elements.stepTranscript.classList.add('hidden');
    this.elements.stepSOAP.classList.add('hidden');

    Storage.clearCurrentSession();
    this.setState(AppState.IDLE);
    this.showAlert('info', 'Session cleared. Ready to record.');
  }

  /**
   * Update recording timer
   */
  updateTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.elements.recordingTimer.textContent =
      `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Set application state and update UI
   */
  setState(newState) {
    this.state = newState;

    // Update UI based on state
    switch (newState) {
      case AppState.IDLE:
        this.elements.startRecordingBtn.classList.remove('hidden');
        this.elements.stopRecordingBtn.classList.add('hidden');
        this.elements.recordingStatus.classList.add('hidden');
        this.elements.recordingInfo.classList.remove('hidden');
        break;

      case AppState.RECORDING:
        this.elements.startRecordingBtn.classList.add('hidden');
        this.elements.stopRecordingBtn.classList.remove('hidden');
        this.elements.recordingStatus.classList.remove('hidden');
        this.elements.recordingInfo.classList.add('hidden');
        break;

      case AppState.TRANSCRIBING:
        this.elements.stopRecordingBtn.classList.add('hidden');
        this.elements.recordingStatus.classList.add('hidden');
        break;

      case AppState.TRANSCRIPT_READY:
        this.elements.generateSOAPBtn.disabled = false;
        break;

      case AppState.GENERATING_SOAP:
        this.elements.generateSOAPBtn.disabled = true;
        break;

      case AppState.SOAP_READY:
        this.elements.generateSOAPBtn.disabled = false;
        break;
    }
  }

  /**
   * Show alert message
   */
  showAlert(type, message) {
    this.elements.alertContainer.textContent = message;
    this.elements.alertContainer.className = 'alert-container alert-' + type;
    this.elements.alertContainer.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.elements.alertContainer.classList.add('hidden');
    }, 5000);
  }

  /**
   * Auto-save current session
   */
  autoSaveSession() {
    const session = {
      transcript: this.elements.transcriptText.value,
      soapHTML: this.elements.soapEditor.innerHTML,
      state: this.state
    };

    Storage.setCurrentSession(session);
  }

  /**
   * Load saved session if available
   */
  loadSavedSession() {
    const session = Storage.getCurrentSession();

    if (session && (session.transcript || session.soapHTML)) {
      if (session.transcript) {
        this.elements.transcriptText.value = session.transcript;
        this.currentTranscript = session.transcript;
        this.elements.stepTranscript.classList.remove('hidden');
        this.elements.transcriptContent.classList.remove('hidden');
      }

      if (session.soapHTML) {
        if (this.richTextEditor) {
          this.richTextEditor.setHTML(session.soapHTML);
        } else {
          this.elements.soapEditor.innerHTML = session.soapHTML;
        }
        this.elements.stepSOAP.classList.remove('hidden');
        this.elements.soapContent.classList.remove('hidden');
      }

      if (session.transcript && session.soapHTML) {
        this.setState(AppState.SOAP_READY);
      } else if (session.transcript) {
        this.setState(AppState.TRANSCRIPT_READY);
      }

      this.showAlert('info', 'Previous session restored.');
    }
  }

  /**
   * Open settings modal
   */
  openSettings() {
    // Load current settings
    this.elements.apiKeyInput.value = Storage.getApiKey();
    this.elements.modelSelect.value = Storage.getTranscriptionModel();
    this.elements.systemPromptInput.value = Storage.getSystemPrompt();

    this.elements.settingsModal.classList.remove('hidden');
  }

  /**
   * Close settings modal
   */
  closeSettings() {
    this.elements.settingsModal.classList.add('hidden');
  }

  /**
   * Test API key
   */
  async testApiKey() {
    const apiKey = this.elements.apiKeyInput.value.trim();

    if (!apiKey) {
      this.showAlert('error', 'Please enter an API key.');
      return;
    }

    this.elements.testApiKeyBtn.disabled = true;
    this.elements.testApiKeyBtn.textContent = 'Testing...';

    try {
      const client = new GeminiClient(apiKey);
      const isValid = await client.testApiKey();

      if (isValid) {
        this.showAlert('success', 'API key is valid!');
      } else {
        this.showAlert('error', 'API key is invalid. Please check and try again.');
      }
    } catch (error) {
      this.showAlert('error', 'Failed to test API key: ' + error.message);
    } finally {
      this.elements.testApiKeyBtn.disabled = false;
      this.elements.testApiKeyBtn.textContent = 'Test';
    }
  }

  /**
   * Reset system prompt to default
   */
  resetPrompt() {
    Storage.resetSystemPrompt();
    this.elements.systemPromptInput.value = Storage.getSystemPrompt();
    this.showAlert('success', 'System prompt reset to default.');
  }

  /**
   * Save settings
   */
  saveSettings() {
    const apiKey = this.elements.apiKeyInput.value.trim();
    const model = this.elements.modelSelect.value;
    const systemPrompt = this.elements.systemPromptInput.value.trim();

    if (!apiKey) {
      this.showAlert('error', 'Please enter an API key.');
      return;
    }

    // Save to storage
    Storage.setApiKey(apiKey);
    Storage.setTranscriptionModel(model);
    Storage.setSOAPModel(model);
    Storage.setSystemPrompt(systemPrompt);

    // Reinitialize Gemini client
    try {
      this.geminiClient = new GeminiClient(apiKey);
      this.showAlert('success', 'Settings saved successfully.');
      this.closeSettings();
    } catch (error) {
      this.showAlert('error', 'Failed to save settings: ' + error.message);
    }
  }

  /**
   * Clear all data
   */
  clearAllData() {
    if (confirm('This will clear all data including API key, history, and current session. Are you sure?')) {
      Storage.clearAllData();
      this.clearSession();
      this.geminiClient = null;
      this.showAlert('info', 'All data cleared. Please configure your API key in settings.');
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

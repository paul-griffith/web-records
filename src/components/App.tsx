/**
 * Main Application Component
 */

import { useState, useEffect } from 'preact/hooks';
import { Header } from './Header';
import { AlertContainer } from './AlertContainer';
import { TranscriptSection } from './TranscriptSection';
import { AnalysisSection } from './AnalysisSection';
import { SettingsModal } from './SettingsModal';
import { Storage } from '../modules/storage';
import { GeminiClient } from '../modules/gemini-client';
import { AudioRecorder } from '../modules/audio-recorder';
import { renderMarkdown } from '../utils/markdown-renderer';
import { copyHTMLToClipboard } from '../utils/clipboard';
import { AppState, AlertType } from '../types';
import { getTemplateById } from '../templates/templates';

export function App() {
  // Application state
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [transcript, setTranscript] = useState<string>('');
  const [soapMarkdown, setSOAPMarkdown] = useState<string>('');
  const [soapHTML, setSOAPHTML] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');

  // UI state
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<AlertType>('info');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Instances
  const [geminiClient, setGeminiClient] = useState<GeminiClient | null>(null);
  const [audioRecorder] = useState<AudioRecorder>(new AudioRecorder());

  // Initialize on mount
  useEffect(() => {
    // Load API key and initialize client
    const key = Storage.getApiKey();

    if (key) {
      setGeminiClient(new GeminiClient(key));
    } else {
      showAlert('Please configure your Gemini API key in settings', 'warning');
      setIsSettingsOpen(true);
    }

    // Load saved template selection
    setSelectedTemplate(Storage.getSelectedTemplate());

    // Attempt to recover session
    const savedSession = Storage.getCurrentSession();
    if (savedSession) {
      if (savedSession.transcript) {
        setTranscript(savedSession.transcript);
        setAppState(AppState.TRANSCRIPT_READY);
      }
      if (savedSession.soap && savedSession.soapHTML) {
        setSOAPMarkdown(savedSession.soap);
        setSOAPHTML(savedSession.soapHTML);
        setAppState(AppState.ANALYSIS_READY);
      }
    }
  }, []);

  // Auto-save current session
  useEffect(() => {
    if (appState !== AppState.IDLE && appState !== AppState.RECORDING) {
      Storage.setCurrentSession({
        transcript,
        soap: soapMarkdown,
        soapHTML,
        state: appState
      });
    }
  }, [appState, transcript, soapMarkdown, soapHTML]);

  // Alert helper
  const showAlert = (message: string, type: AlertType = 'info') => {
    setAlertMessage(message);
    setAlertType(type);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  };

  // Recording handlers
  const handleStartRecording = async (_getCursorPosition: () => number) => {
    try {
      await audioRecorder.initialize();
      audioRecorder.start();
      setAppState(AppState.RECORDING);
      showAlert('Recording started', 'success');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start recording';
      showAlert(errorMsg, 'error');
    }
  };

  const handleStopRecording = async (getCursorPosition: () => number, setSelectionRange: (start: number, end: number) => void) => {
    try {
      const audioData = await audioRecorder.stop();
      setAppState(AppState.TRANSCRIBING);

      // Transcribe audio
      if (!geminiClient) {
        throw new Error('Gemini client not initialized');
      }

      const transcribedText = await geminiClient.transcribeAudio(
        audioData.blob,
        audioData.mimeType,
      );

      // Insert at cursor position instead of replacing
      const cursorPos = getCursorPosition();
      const before = transcript.slice(0, cursorPos);
      const after = transcript.slice(cursorPos);
      const newTranscript = before + transcribedText + after;

      setTranscript(newTranscript);
      setAppState(AppState.TRANSCRIPT_READY);
      showAlert('Transcription inserted!', 'success');

      // Set cursor after inserted text
      const newCursorPos = cursorPos + transcribedText.length;
      setTimeout(() => {
        setSelectionRange(newCursorPos, newCursorPos);
      }, 0);

      // Cleanup
      audioRecorder.cleanup();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Transcription failed';
      showAlert(errorMsg, 'error');
      setAppState(AppState.IDLE);
    }
  };

  const handleGenerateNote = async () => {
    try {
      setAppState(AppState.GENERATING);

      if (!geminiClient) {
        throw new Error('Gemini client not initialized');
      }

      const systemPrompt = Storage.getSystemPrompt();

      // Get template content from current selection
      const template = getTemplateById(selectedTemplate);
      const templateContent = template?.content || '';

      // Save the template selection to storage
      Storage.setSelectedTemplate(selectedTemplate);

      const soapText = await geminiClient.generateNote(
        transcript,
        systemPrompt,
        templateContent
      );

      setSOAPMarkdown(soapText);
      const html = renderMarkdown(soapText);
      setSOAPHTML(html);
      setAppState(AppState.ANALYSIS_READY);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Generation failed';
      showAlert(errorMsg, 'error');
      setAppState(AppState.TRANSCRIPT_READY);
    }
  };

  // SOAP handlers
  const handleCopySOAP = async (html: string, text: string) => {
    try {
      const success = await copyHTMLToClipboard(html, text);
      if (success) {
        showAlert('Copied to clipboard!', 'success');
      } else {
        showAlert('Failed to copy to clipboard', 'error');
      }
    } catch (error) {
      showAlert('Failed to copy to clipboard', 'error');
    }
  };

  const handleSaveSOAP = (html: string) => {
    setSOAPHTML(html);

    // Save to session history
    Storage.addSessionToHistory({
      transcript,
      soap: soapMarkdown,
      soapHTML: html,
      state: appState,
      timestamp: new Date().toISOString()
    });

    showAlert('Session saved to history', 'success');
  };

  // Settings handlers
  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleSettingsSave = (newApiKey: string, systemPrompt: string) => {
    Storage.setApiKey(newApiKey);
    Storage.setSystemPrompt(systemPrompt);

    setGeminiClient(new GeminiClient(newApiKey));

    showAlert('Settings saved!', 'success');
  };

  const handleTestApiKey = async (testKey: string): Promise<boolean> => {
    try {
      const client = new GeminiClient(testKey);
      return await client.testApiKey();
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="app-container">
      <Header onSettingsClick={handleSettingsOpen} />

      <AlertContainer
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />

      <div className="two-column-layout">
        <div className="left-column">
          <TranscriptSection
            appState={appState}
            transcript={transcript}
            onTranscriptChange={setTranscript}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        </div>

        <div className="right-column">
          <AnalysisSection
            appState={appState}
            soapHTML={soapHTML}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            onGenerateSOAP={handleGenerateNote}
            onCopy={handleCopySOAP}
            onSave={handleSaveSOAP}
          />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        onSave={handleSettingsSave}
        onTestApiKey={handleTestApiKey}
      />
    </div>
  );
}

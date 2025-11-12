import { useEffect, useState } from 'preact/hooks';
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
import { AlertType, AppState } from '../types';
import { DEFAULT_PROMPT } from "../content/prompt";
import { getTemplateById } from "../content/templates";

export function App() {
  // Application state
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [transcript, setTranscript] = useState<string>('');
  const [soapMarkdown, setSOAPMarkdown] = useState<string>('');
  const [soapHTML, setSOAPHTML] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_PROMPT);
  const [templateBody, setTemplateBody] = useState<string>('');

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

    setSelectedTemplate('none');
  }, []);

  useEffect(() => {
  }, [appState, transcript, soapMarkdown, soapHTML, systemPrompt, templateBody]);

  function showAlert(message: string, type: AlertType = 'info') {
    setAlertMessage(message);
    setAlertType(type);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  }

  async function handleStartRecording(_getCursorPosition: () => number) {
    try {
      await audioRecorder.initialize();
      audioRecorder.start();
      setAppState(AppState.RECORDING);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start recording';
      showAlert(errorMsg, 'error');
    }
  }

  async function handleStopRecording(getCursorPosition: () => number,
                                     setSelectionRange: (start: number, end: number) => void) {
    try {
      const audioData = await audioRecorder.stop();
      setAppState(AppState.TRANSCRIBING);

      // Transcribe audio
      if (!geminiClient) {
        showAlert('Gemini client not initialized', 'error');
        setAppState(AppState.IDLE);
        return;
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
  }

  async function handleGenerateNote() {
    try {
      setAppState(AppState.GENERATING);

      if (!geminiClient) {
        showAlert('Gemini client not initialized', 'error');
        setAppState(AppState.TRANSCRIPT_READY);
        return;
      }

      const soapText = await geminiClient.generateNote(
        transcript,
        systemPrompt,
        templateBody
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
  }

  async function handleCopySOAP(html: string, text: string) {
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
  }

  function handleSettingsOpen() {
    setIsSettingsOpen(true);
  }

  function handleSettingsClose() {
    setIsSettingsOpen(false);
  }

  function handleSettingsSave(newApiKey: string) {
    Storage.setApiKey(newApiKey);

    setGeminiClient(new GeminiClient(newApiKey));

    showAlert('Settings saved!', 'success');
  }

  function handleTemplateChange(templateId: string) {
    setSelectedTemplate(templateId);
    setTemplateBody(getTemplateById(templateId)?.content ?? '');
  }

  async function handleTestApiKey(testKey: string): Promise<boolean> {
    try {
      const client = new GeminiClient(testKey);
      return await client.testApiKey();
    } catch (error) {
      return false;
    }
  }

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
            systemPrompt={systemPrompt}
            templateBody={templateBody}
            onPromptChange={
              (systemPrompt, templateBody) => {
                setSystemPrompt(systemPrompt);
                setTemplateBody(templateBody);
              }
            }
            onTemplateChange={handleTemplateChange}
            onGenerateSOAP={handleGenerateNote}
            onCopy={handleCopySOAP}
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

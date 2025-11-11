/**
 * Transcript review section component
 */

import type { JSX } from 'preact';
import { Button } from './shared/Button';
import { Loading } from './shared/Loading';
import { AppState } from '../types';
import { getAllTemplates } from '../templates/soap-templates';

interface TranscriptSectionProps {
  appState: AppState;
  transcript: string;
  selectedTemplate: string;
  onTranscriptChange: (value: string) => void;
  onTemplateChange: (templateId: string) => void;
  onReRecord: () => void;
  onGenerateSOAP: () => Promise<void>;
}

export function TranscriptSection({
  appState,
  transcript,
  selectedTemplate,
  onTranscriptChange,
  onTemplateChange,
  onReRecord,
  onGenerateSOAP
}: TranscriptSectionProps) {
  const isTranscribing = appState === AppState.TRANSCRIBING;
  const isTranscriptReady = appState === AppState.TRANSCRIPT_READY;
  const hasTranscript = transcript.length > 0;

  const templates = getAllTemplates();

  const handleTextAreaChange = (e: JSX.TargetedEvent<HTMLTextAreaElement>) => {
    onTranscriptChange(e.currentTarget.value);
  };

  const handleTemplateChange = (e: JSX.TargetedEvent<HTMLSelectElement>) => {
    onTemplateChange(e.currentTarget.value);
  };

  return (
    <section id="step-transcript" className="card">
      <h2>Review Transcript</h2>

      {isTranscribing && (
        <Loading message="Transcribing audio..." />
      )}

      {!isTranscribing && (
        <div id="transcript-content">
          <textarea
            id="transcript-text"
            className="transcript-editor"
            placeholder="Transcript will appear here..."
            rows={12}
            value={transcript}
            onInput={handleTextAreaChange}
          />

          <div className="form-group">
            <label htmlFor="template-select">SOAP Note Template</label>
            <select
              id="template-select"
              className="input-field"
              value={selectedTemplate}
              onChange={handleTemplateChange}
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <p className="help-text">
              {templates.find(t => t.id === selectedTemplate)?.description}
            </p>
          </div>

          <div className="button-group">
            <Button
              className="btn btn-secondary"
              onClick={onReRecord}
              disabled={!hasTranscript}
            >
              Re-record
            </Button>
            <Button
              className="btn btn-primary"
              onClick={onGenerateSOAP}
              disabled={!isTranscriptReady}
            >
              Generate SOAP Note
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

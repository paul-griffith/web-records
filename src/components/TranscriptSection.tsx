/**
 * Transcript review section component
 */

import type { JSX } from 'preact';
import { Button } from './shared/Button';
import { Loading } from './shared/Loading';
import { AppState } from '../types';

interface TranscriptSectionProps {
  appState: AppState;
  transcript: string;
  onTranscriptChange: (value: string) => void;
  onReRecord: () => void;
  onGenerateSOAP: () => Promise<void>;
}

export function TranscriptSection({
  appState,
  transcript,
  onTranscriptChange,
  onReRecord,
  onGenerateSOAP
}: TranscriptSectionProps) {
  const isTranscribing = appState === AppState.TRANSCRIBING;
  const isTranscriptReady = appState === AppState.TRANSCRIPT_READY;
  const isVisible = isTranscribing || isTranscriptReady;

  if (!isVisible) {
    return <section id="step-transcript" className="card hidden"></section>;
  }

  const handleTextAreaChange = (e: JSX.TargetedEvent<HTMLTextAreaElement>) => {
    onTranscriptChange(e.currentTarget.value);
  };

  return (
    <section id="step-transcript" className="card">
      <h2>Step 2: Review Transcript</h2>

      {isTranscribing && (
        <Loading message="Transcribing audio..." />
      )}

      {isTranscriptReady && (
        <div id="transcript-content">
          <textarea
            id="transcript-text"
            className="transcript-editor"
            placeholder="Transcript will appear here..."
            rows={12}
            value={transcript}
            onInput={handleTextAreaChange}
          />
          <div className="button-group">
            <Button
              className="btn btn-secondary"
              onClick={onReRecord}
            >
              Re-record
            </Button>
            <Button
              className="btn btn-primary"
              onClick={onGenerateSOAP}
            >
              Generate SOAP Note
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

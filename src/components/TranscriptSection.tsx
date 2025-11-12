import { useRef, useState } from 'preact/hooks';
import { TargetedEvent } from 'preact';
import { Button } from './shared/Button';
import { Loading } from './shared/Loading';
import { AppState } from '../types';

interface TranscriptSectionProps {
  appState: AppState;
  transcript: string;
  onTranscriptChange: (value: string) => void;
  onStartRecording: (getCursorPosition: () => number) => Promise<void>;
  onStopRecording: (getCursorPosition: () => number, setSelectionRange: (start: number, end: number) => void) => Promise<void>;
}

export function TranscriptSection({
  appState,
  transcript,
  onTranscriptChange,
  onStartRecording,
  onStopRecording
}: TranscriptSectionProps) {
  const isRecording = appState === AppState.RECORDING;
  const isTranscribing = appState === AppState.TRANSCRIBING;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const getCursorPosition = (): number => {
    return textareaRef.current?.selectionStart ?? transcript.length;
  };

  const setSelectionRange = (start: number, end: number): void => {
    textareaRef.current?.setSelectionRange(start, end);
    textareaRef.current?.focus();
  };

  const handleTextAreaChange = (e: TargetedEvent<HTMLTextAreaElement>) => {
    onTranscriptChange(e.currentTarget.value);
  };

  const handleStartRecording = async () => {
    await onStartRecording(getCursorPosition);

    // Start timer
    const id = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const handleStopRecording = async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setRecordingTime(0);
    await onStopRecording(getCursorPosition, setSelectionRange);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="transcript-section">
      <div className="transcript-content">
        <textarea
          ref={textareaRef}
          id="transcript-text"
          className="transcript-editor"
          placeholder="Click 'Start Recording' to begin transcription..."
          value={transcript}
          onInput={handleTextAreaChange}
        />
      </div>

      {isTranscribing && (
        <Loading message="Transcribing audio..." />
      )}

      <div className="section-header">
        {!isRecording ? (
          <Button
            className="btn btn-primary"
            onClick={handleStartRecording}
            disabled={isTranscribing}
          >
            {transcript.length > 0 ? 'Insert Recording' : 'Start Recording'}
          </Button>
        ) : (
          <div className="recording-controls-inline">
            <div className="recording-status-inline">
              <div className="status-indicator recording"></div>
              <span className="recording-timer">{formatTime(recordingTime)}</span>
            </div>
            <Button
              className="btn btn-danger"
              onClick={handleStopRecording}
            >
              Stop Recording
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

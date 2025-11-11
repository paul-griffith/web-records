/**
 * Audio recording section component
 */

import { useState } from 'preact/hooks';
import { Button } from './shared/Button';
import { AppState } from '../types';

interface RecordingSectionProps {
  appState: AppState;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => Promise<void>;
}

export function RecordingSection({
  appState,
  onStartRecording,
  onStopRecording
}: RecordingSectionProps) {
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const isRecording = appState === AppState.RECORDING;

  const handleStartRecording = async () => {
    await onStartRecording();

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
    await onStopRecording();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <section id="step-recording" className="card">
      <h2>Record Consultation</h2>
      <div className="recording-controls">
        {!isRecording ? (
          <Button
            className="btn btn-primary"
            onClick={handleStartRecording}
          >
            Start Recording
          </Button>
        ) : (
          <Button
            className="btn btn-danger"
            onClick={handleStopRecording}
          >
            Stop Recording
          </Button>
        )}
      </div>
      {isRecording && (
        <div id="recording-status" className="status-display">
          <div className="status-indicator recording"></div>
          <span id="recording-timer">{formatTime(recordingTime)}</span>
        </div>
      )}
    </section>
  );
}

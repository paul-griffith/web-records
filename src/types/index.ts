/**
 * Type definitions for the application
 */

export interface AudioData {
  blob: Blob;
  mimeType: string;
  duration: number;
}

export enum AppState {
  IDLE = 'idle',
  RECORDING = 'recording',
  TRANSCRIBING = 'transcribing',
  TRANSCRIPT_READY = 'transcript_ready',
  GENERATING = 'generating',
  ANALYSIS_READY = 'analysis_ready',
}

export interface StorageKeys {
  API_KEY: string;
  SELECTED_TEMPLATE: string;
}

export interface Template {
  name: string;
  systemPrompt: string;
  content: string;
}

export type AlertType = 'error' | 'success' | 'info' | 'warning';

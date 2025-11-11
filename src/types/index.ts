/**
 * Type definitions for the application
 */

export interface AudioData {
  blob: Blob;
  mimeType: string;
  duration: number;
}

export interface Session {
  transcript?: string;
  soap?: string;
  soapHTML?: string;
  state?: AppState;
  timestamp?: string;
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
  SYSTEM_PROMPT: string;
  CURRENT_SESSION: string;
  SESSION_HISTORY: string;
  SELECTED_TEMPLATE: string;
}

export interface Template {
  name: string;
  content: string;
}

export type AlertType = 'error' | 'success' | 'info' | 'warning';

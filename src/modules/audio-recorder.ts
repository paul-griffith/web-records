/**
 * Audio recording module using MediaRecorder API
 * Handles microphone access and audio capture
 */

import { AudioData } from '../types';

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number | null = null;
  private timerInterval: NodeJS.Timeout | null = null;

  /**
   * Check if browser supports audio recording
   */
  static isSupported(): boolean {
    if (typeof navigator === 'undefined' || typeof MediaRecorder === 'undefined') {
      return false;
    }
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Request microphone permission and initialize recorder
   */
  async initialize(): Promise<boolean> {
    if (!AudioRecorder.isSupported()) {
      throw new Error('Audio recording is not supported in this browser. Please use Chrome or Firefox.');
    }

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create MediaRecorder with supported mime type
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Microphone permission denied. Please allow microphone access to record audio.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else {
          throw new Error(`Failed to initialize audio recorder: ${error.message}`);
        }
      } else {
        throw new Error('Failed to initialize audio recorder: Unknown error');
      }
    }
  }

  /**
   * Get supported MIME type for MediaRecorder
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return ''; // Use browser default
  }

  /**
   * Start recording
   */
  start(onTimeUpdate?: (elapsed: number) => void): void {
    if (!this.mediaRecorder) {
      throw new Error('Recorder not initialized. Call initialize() first.');
    }

    if (this.mediaRecorder.state === 'recording') {
      throw new Error('Recording already in progress.');
    }

    this.audioChunks = [];
    this.startTime = Date.now();

    // Start timer updates
    if (onTimeUpdate) {
      this.timerInterval = setInterval(() => {
        if (this.startTime) {
          const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
          onTimeUpdate(elapsed);
        }
      }, 1000);
    }

    this.mediaRecorder.start();
  }

  /**
   * Stop recording and return audio blob
   */
  async stop(): Promise<AudioData> {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      throw new Error('No active recording to stop.');
    }

    // Clear timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        if (!this.mediaRecorder || !this.startTime) {
          reject(new Error('Recording state invalid'));
          return;
        }

        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const duration = Math.floor((Date.now() - this.startTime) / 1000);

        resolve({
          blob: audioBlob,
          mimeType: mimeType,
          duration: duration
        });
      };

      this.mediaRecorder.onerror = (event: Event) => {
        reject(new Error(`Recording error: ${(event as ErrorEvent).message || 'Unknown error'}`));
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState {
    return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
  }

  /**
   * Get recording duration in seconds
   */
  getDuration(): number {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = null;
  }
}

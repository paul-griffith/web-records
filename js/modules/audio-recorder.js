/**
 * Audio recording module using MediaRecorder API
 * Handles microphone access and audio capture
 */

export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.startTime = null;
    this.timerInterval = null;
  }

  /**
   * Check if browser supports audio recording
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  /**
   * Request microphone permission and initialize recorder
   */
  async initialize() {
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
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      return true;
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone permission denied. Please allow microphone access to record audio.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else {
        throw new Error(`Failed to initialize audio recorder: ${error.message}`);
      }
    }
  }

  /**
   * Get supported MIME type for MediaRecorder
   */
  getSupportedMimeType() {
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
  start(onTimeUpdate) {
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
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        onTimeUpdate(elapsed);
      }, 1000);
    }

    this.mediaRecorder.start();
  }

  /**
   * Stop recording and return audio blob
   */
  async stop() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      throw new Error('No active recording to stop.');
    }

    // Clear timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    return new Promise((resolve, reject) => {
      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const duration = Math.floor((Date.now() - this.startTime) / 1000);

        resolve({
          blob: audioBlob,
          mimeType: mimeType,
          duration: duration
        });
      };

      this.mediaRecorder.onerror = (error) => {
        reject(new Error(`Recording error: ${error.message}`));
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Get current recording state
   */
  getState() {
    return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
  }

  /**
   * Get recording duration in seconds
   */
  getDuration() {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Clean up resources
   */
  cleanup() {
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

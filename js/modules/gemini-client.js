/**
 * Gemini API client for transcription and SOAP generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Convert audio blob to base64 for Gemini API
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get MIME type compatible with Gemini
   */
  getGeminiMimeType(mimeType) {
    // Gemini supports specific audio formats
    if (mimeType.includes('webm')) return 'audio/webm';
    if (mimeType.includes('mp3')) return 'audio/mp3';
    if (mimeType.includes('wav')) return 'audio/wav';
    if (mimeType.includes('ogg')) return 'audio/ogg';
    return 'audio/webm'; // default
  }

  /**
   * Transcribe audio to text using Gemini
   * @param {Blob} audioBlob - Audio data
   * @param {string} mimeType - MIME type of audio
   * @param {string} modelName - Model to use (default: gemini-2.0-flash-exp)
   * @returns {Promise<string>} Transcribed text
   */
  async transcribeAudio(audioBlob, mimeType, modelName = 'gemini-2.0-flash-exp') {
    try {
      const model = this.genAI.getGenerativeModel({ model: modelName });

      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      const geminiMimeType = this.getGeminiMimeType(mimeType);

      // Prepare the prompt and audio data
      const prompt = `Transcribe this veterinary consultation audio into text. Include all spoken content accurately, preserving medical terminology. Format as plain text without adding any commentary or notes.`;

      const imageParts = [
        {
          inlineData: {
            data: base64Audio,
            mimeType: geminiMimeType
          }
        }
      ];

      // Generate transcription
      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Transcription returned empty result');
      }

      return text.trim();
    } catch (error) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your Gemini API key in settings.');
      } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message.includes('audio') || error.message.includes('format')) {
        throw new Error('Audio format not supported. Please try recording again.');
      } else {
        throw new Error(`Transcription failed: ${error.message}`);
      }
    }
  }

  /**
   * Generate SOAP note from transcript using Gemini
   * @param {string} transcript - Transcribed text
   * @param {string} systemPrompt - System prompt for SOAP generation
   * @param {string} modelName - Model to use (default: gemini-2.0-flash-exp)
   * @returns {Promise<string>} SOAP note in Markdown format
   */
  async generateSOAP(transcript, systemPrompt, modelName = 'gemini-2.0-flash-exp') {
    try {
      const model = this.genAI.getGenerativeModel({ model: modelName });

      // Combine system prompt with transcript
      const fullPrompt = `${systemPrompt}

Transcript:
${transcript}`;

      // Generate SOAP note
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('SOAP generation returned empty result');
      }

      return text.trim();
    } catch (error) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your Gemini API key in settings.');
      } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      } else {
        throw new Error(`SOAP generation failed: ${error.message}`);
      }
    }
  }

  /**
   * Test API key validity
   * @returns {Promise<boolean>} True if API key is valid
   */
  async testApiKey() {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const result = await model.generateContent('Hello');
      await result.response;
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Gemini API client for transcription and SOAP generation
 */

import { GoogleGenAI } from '@google/genai';

export class GeminiClient {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.genAI = new GoogleGenAI({ apiKey });
  }

  /**
   * Convert audio blob to base64 for Gemini API
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get MIME type compatible with Gemini
   */
  private getGeminiMimeType(mimeType: string): string {
    // Gemini supports specific audio formats
    if (mimeType.includes('webm')) return 'audio/webm';
    if (mimeType.includes('mp3')) return 'audio/mp3';
    if (mimeType.includes('wav')) return 'audio/wav';
    if (mimeType.includes('ogg')) return 'audio/ogg';
    return 'audio/webm'; // default
  }

  /**
   * Transcribe audio to text using Gemini
   * @param audioBlob - Audio data
   * @param mimeType - MIME type of audio
   * @param modelName - Model to use
   * @returns Transcribed text
   */
  async transcribeAudio(
    audioBlob: Blob,
    mimeType: string,
    modelName: string
  ): Promise<string> {
    try {
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      const geminiMimeType = this.getGeminiMimeType(mimeType);

      // Prepare the prompt and audio data
      const prompt = `Transcribe this veterinary consultation audio into text.
        Include all spoken content accurately, preserving medical terminology.
        Format as plain text without adding any commentary or notes.
        Spoken punctuation or formatting guidelines (such as "enter" or "period") should be interpreted before output, not returned verbatim.
        Common abbreviations included Loomis Basin Veterinary Clinic (LBVC), coughing/sneezing/vomiting/diarrhea (C/S/V/D), patient as P, owner as O.`;

      // Generate transcription using new API
      const response = await this.genAI.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Audio,
                  mimeType: geminiMimeType
                }
              }
            ]
          }
        ],
        config: {
          systemInstruction: prompt,
        },
      });

      const text = response.text;

      if (!text || text.trim().length === 0) {
        throw new Error('Transcription returned empty result');
      }

      return text.trim();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
        throw new Error('Invalid API key. Please check your Gemini API key in settings.');
      } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      } else if (errorMessage.includes('audio') || errorMessage.includes('format')) {
        throw new Error('Audio format not supported. Please try recording again.');
      } else {
        throw new Error(`Transcription failed: ${errorMessage}`);
      }
    }
  }

  /**
   * Generate SOAP note from transcript using Gemini
   * @param transcript - Transcribed text
   * @param systemPrompt - System prompt for SOAP generation
   * @param modelName - Model to use
   * @returns SOAP note in Markdown format
   */
  async generateSOAP(
    transcript: string,
    systemPrompt: string,
    modelName: string
  ): Promise<string> {
    try {
      const response = await this.genAI.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              { text: "The user's transcription follows:"},
              { text: transcript }
            ],
          },
        ],
        config: {
          // thinkingConfig: {
          //   thinkingBudget: -1,
          // },
          systemInstruction: systemPrompt,
        },
      });

      const text = response.text;

      if (!text || text.trim().length === 0) {
        throw new Error('SOAP generation returned empty result');
      }

      return text.trim();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
        throw new Error('Invalid API key. Please check your Gemini API key in settings.');
      } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      } else {
        throw new Error(`SOAP generation failed: ${errorMessage}`);
      }
    }
  }

  /**
   * Test API key validity
   * @returns True if API key is valid
   */
  async testApiKey(): Promise<boolean> {
    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Hello'
      });
      return !!(response && response.text);
    } catch (error) {
      return false;
    }
  }
}

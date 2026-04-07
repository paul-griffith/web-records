import { abbreviations } from './abbreviations';

export const TRANSCRIPTION_PROMPT =
  `Transcribe this veterinary consultation audio into text.
  Include all spoken content accurately, preserving medical terminology.
  Format as plain text without adding any commentary or notes.
  Spoken punctuation or formatting guidelines (such as "enter" or "period") should be interpreted before output, not returned verbatim.
  Common abbreviations include ${Array.from(abbreviations.entries()).map(([key, value]) => `${key}: ${value}`).join(', ')}`;

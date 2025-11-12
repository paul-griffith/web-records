# Veterinary Record Analysis

A client-side web application for veterinary professionals to record consultations, transcribe them using Google Gemini AI, and generate structured SOAP notes.

## Getting Started

### Prerequisites

- Modern web browser (Chrome or Firefox recommended)
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))
- Microphone for audio recording

### Configuration

1. Click the settings icon (⚙️) in the top right
2. Enter your Gemini API key
3. Click "Test" to verify the key works
4. Optionally customize the system prompt for SOAP generation
5. Click "Save Settings"

## Usage

### Basic Workflow

1. Record: Transcribes your spoken notes
2. Review Transcript: Edit the AI-generated transcript if needed
3. Generate SOAP: Choose a template and click 'Generate' to feed your transcript, the template, and the system prompt into the LLM.
4. Copy: Click "Copy as HTML" to copy the full note to the clipboard to paste into WoofWare

## Privacy & Security

- No Server: All processing happens in your browser
- Local Storage: API keys and data are stored only in your browser
- BYOK Model: You control your own API key
- No Tracking: No analytics or data collection

⚠️ **Important**: API keys are stored in browser localStorage in plain text. Use on trusted devices only. Clear browser data when using shared computers.

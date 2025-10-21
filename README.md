# Veterinary SOAP Note Generator

A client-side web application for veterinary professionals to record consultations, transcribe them using Google Gemini AI, and generate structured SOAP notes.

## Features

- **Audio Recording**: Record veterinary consultations directly in your browser
- **AI Transcription**: Automatic transcription using Google Gemini's multimodal capabilities
- **SOAP Note Generation**: Generate structured SOAP (Subjective/Objective/Assessment/Plan) notes from transcripts
- **Editable Output**: Review and edit both transcripts and SOAP notes before finalizing
- **Copy to Clipboard**: Copy formatted SOAP notes as HTML for pasting into EMR systems
- **Privacy-Focused**: All data stays in your browser (no server-side storage)
- **Bring Your Own Key**: Uses your personal Gemini API key

## Getting Started

### Prerequisites

- Modern web browser (Chrome or Firefox recommended)
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))
- Microphone for audio recording

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/web-records.git
   cd web-records
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:8081`

### Configuration

1. Click the settings icon (⚙️) in the top right
2. Enter your Gemini API key
3. Click "Test" to verify the key works
4. Optionally customize the system prompt for SOAP generation
5. Click "Save Settings"

## Usage

### Basic Workflow

1. **Record**: Click "Start Recording" and speak your veterinary consultation notes
2. **Stop**: Click "Stop Recording" when finished
3. **Review Transcript**: Edit the AI-generated transcript if needed
4. **Generate SOAP**: Click "Generate SOAP Note" to create a structured note
5. **Copy**: Click "Copy as HTML" to copy the formatted note
6. **Paste**: Paste the SOAP note into your EMR system

### Tips for Best Results

- Speak clearly and at a moderate pace
- Use proper veterinary terminology
- Mention all relevant details (patient info, symptoms, findings, plan)
- Review and correct the transcript before generating SOAP notes
- Edit the SOAP note as needed before copying

## System Prompt

The default system prompt instructs Gemini to format notes as:

- **Subjective**: Patient history, owner concerns, symptoms reported
- **Objective**: Physical exam findings, vital signs, observable data
- **Assessment**: Diagnosis or differential diagnoses
- **Plan**: Treatment plan, medications, follow-up instructions

You can customize this prompt in Settings to match your clinic's format.

## Development

### Project Structure

```
web-records/
├── js/
│   ├── app.js                    # Main application controller
│   ├── modules/
│   │   ├── storage.js            # LocalStorage wrapper
│   │   ├── audio-recorder.js     # Audio recording module
│   │   └── gemini-client.js      # Gemini API client
│   └── utils/
│       ├── markdown-renderer.js  # Markdown to HTML conversion
│       └── clipboard.js          # Clipboard utilities
├── css/
│   └── style.css                 # Application styles
├── index.html                    # Main HTML page
├── package.json                  # Dependencies
└── webpack.config.*.js           # Webpack configuration
```

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized files ready for deployment.

## Deployment to GitHub Pages

1. Build the production version:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to GitHub Pages:
   ```bash
   # If using gh-pages branch
   git subtree push --prefix dist origin gh-pages

   # Or use GitHub Pages settings to deploy from dist/ folder
   ```

3. Configure GitHub repository settings:
   - Go to Settings > Pages
   - Set source to the gh-pages branch or docs folder
   - Save and wait for deployment

## Privacy & Security

- **No Server**: All processing happens in your browser
- **Local Storage**: API keys and data are stored only in your browser
- **BYOK Model**: You control your own API key
- **No Tracking**: No analytics or data collection
- **HIPAA Note**: This tool generates notes but doesn't store PHI

⚠️ **Important**: API keys are stored in browser localStorage in plain text. Use on trusted devices only. Clear browser data when using shared computers.

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ⚠️ Safari (Limited testing)

Requires:
- MediaRecorder API
- getUserMedia API
- Clipboard API
- LocalStorage

## Cost Estimates

Using Gemini 2.0 Flash:
- ~$0.0003 per consultation (typical 5-minute recording)
- Very low cost for 1-2 users

Monitor your usage at [Google AI Studio](https://aistudio.google.com).

## Troubleshooting

### Microphone Access Denied
- Check browser permissions for microphone access
- Look for blocked permissions icon in address bar

### Transcription Errors
- Ensure good audio quality (minimize background noise)
- Speak clearly and at moderate pace
- Check API key is valid

### API Key Invalid
- Verify key is correct at [Google AI Studio](https://aistudio.google.com/apikey)
- Ensure key has access to Gemini API
- Check for any usage limits or restrictions

### Copy to Clipboard Not Working
- Some browsers require HTTPS for clipboard access
- Use the fallback: select text manually and copy

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## License

MIT License - See LICENSE.txt for details

## Version

Current version: 0.1.0

## Changelog

### v0.1.0 (Initial Release)
- Audio recording from browser microphone
- Gemini-powered transcription
- SOAP note generation with editable output
- Copy to clipboard as HTML
- LocalStorage persistence
- Settings management

# Implementation Plan: Veterinary SOAP Note Generator

## Project Overview
A professional client-side web application for veterinary medical professionals to record audio during patient interactions, transcribe the audio using Google Gemini, and generate structured SOAP (Subjective/Objective/Assessment/Plan) notes. The application uses a "bring your own key" (BYOK) model with the Gemini API key stored locally in the browser.

**Target Users:** 1-2 veterinary medical professionals
**Hosting:** GitHub Pages (static site)
**Priority:** Correctness and stability over appearance
**Dependencies:** Minimal external libraries

---

## Core Workflow

1. User initiates audio recording of veterinary interaction
2. Audio is transcribed via Gemini API into editable text
3. User reviews and corrects transcript as needed
4. Transcript + system prompt sent to Gemini for SOAP note generation
5. Markdown response rendered in rich text editor
6. User copies formatted SOAP note as HTML to paste into EMR software

---

## Phase 1: Project Foundation

### 1.1 Project Structure Setup
- Update `package.json` with accurate project metadata
- Minimal dependencies to add:
  - Google Generative AI SDK (`@google/generative-ai`)
  - Markdown-to-HTML converter (lightweight: `marked` ~2KB minified)
  - Optional: Simple rich text editor or contenteditable wrapper
- Configure webpack for production build targeting GitHub Pages
- Set up dist/ folder structure for deployment

### 1.2 Architecture Design
**Module Structure:**
```
js/
├── app.js (entry point, initialization)
├── modules/
│   ├── storage.js (localStorage wrapper for API key, prompts, history)
│   ├── gemini-client.js (Gemini API integration)
│   ├── audio-recorder.js (MediaRecorder wrapper)
│   ├── transcription.js (audio → text via Gemini)
│   ├── soap-generator.js (transcript → SOAP note)
│   └── ui-controller.js (state management, UI updates)
└── utils/
    ├── markdown-renderer.js (Markdown → HTML with sanitization)
    └── clipboard.js (copy HTML to clipboard)
```

---

## Phase 2: Core Infrastructure

### 2.1 Local Storage System
**Key Storage:**
- `gemini_api_key` - User's Gemini API key
- `system_prompt` - Customizable SOAP generation prompt (with default)
- `recording_history` - Optional: Array of recent sessions (transcript + SOAP note)

**Implementation:**
- Simple wrapper functions: `setApiKey()`, `getApiKey()`, `setSystemPrompt()`, `getSystemPrompt()`
- Data stored as plain JSON (no encryption needed for 1-2 user tool)
- Clear browser storage warning in UI

### 2.2 Gemini API Client
**Features:**
- Initialize client with stored API key
- Two primary functions:
  - `transcribeAudio(audioBlob)` - Send audio to Gemini for transcription
  - `generateSOAP(transcript, systemPrompt)` - Generate SOAP note from transcript
- Error handling for API failures (invalid key, rate limits, network errors)
- Token usage tracking (optional, for cost awareness)

**API Configuration:**
- Model selection: `gemini-2.5-flash` or `gemini-2.5-pro` (configurable)
- Audio transcription: Use Gemini's multimodal capabilities
- Text generation: Standard text generation for SOAP notes

---

## Phase 3: Audio Recording System

### 3.1 Browser Audio Recording
**Implementation using MediaRecorder API:**
- Request microphone permission on first use
- Support browser's default audio input selection
- Record in supported format (WebM/Opus or browser default)
- Real-time recording indicator (time elapsed, recording status)
- No audio visualization needed (simplicity over flash)

**UI Components:**
- "Start Recording" button (begins recording)
- "Stop Recording" button (ends recording, proceeds to transcription)
- Recording timer display
- Status indicator (idle, recording, processing)

**Technical Details:**
- Use `navigator.mediaDevices.getUserMedia()` for audio stream
- `MediaRecorder` with default mime type for compatibility
- Store recorded chunks in memory
- Convert to Blob on completion
- No file upload/download needed

### 3.2 Audio Constraints
- Single-session recording (no pause/resume to minimize complexity)
- Reasonable length limits (warn if >10-15 minutes for API constraints)
- Handle browser compatibility (Chrome, Firefox)

---

## Phase 4: Transcription Workflow

### 4.1 Gemini Transcription Integration
**Process:**
1. Convert audio Blob to format suitable for Gemini API
2. Send audio to Gemini with transcription instructions
3. Display loading state during API call
4. Render returned transcript in editable textarea

**Error Handling:**
- API key validation before sending
- Network error recovery
- Audio format compatibility checking
- Clear error messages for user

### 4.2 Transcript Editor
**Simple Implementation:**
- Plain `<textarea>` with adequate sizing
- Autosave to localStorage (prevent data loss)
- Character count (optional)
- "Proceed to SOAP Generation" button
- "Re-record" button (clear and start over)

**Data Flow:**
- Audio → Gemini API → Plain text → Editable textarea
- User edits → Updated text stored in memory
- "Confirm Transcript" → Proceed to Phase 5

---

## Phase 5: SOAP Note Generation

### 5.1 System Prompt Management
**Default Prompt:**
```
You are a veterinary medical assistant. Convert the following veterinary
consultation transcript into a structured SOAP note format.

SOAP Format:
- Subjective: Patient history, owner concerns, symptoms reported
- Objective: Physical exam findings, vital signs, observable data
- Assessment: Diagnosis or differential diagnoses
- Plan: Treatment plan, medications, follow-up instructions

Format your response in clean Markdown with clear section headers.
Be concise but thorough. Use professional veterinary terminology.

Transcript:
[TRANSCRIPT_HERE]
```

**User Customization:**
- Editable system prompt in settings panel
- Reset to default option
- Prompt preview before generation
- Prompt stored in localStorage

### 5.2 SOAP Generation Process
1. Combine system prompt + transcript
2. Send to Gemini API
3. Receive Markdown response
4. Convert Markdown → HTML
5. Render in editable rich text field

### 5.3 SOAP Note Editor
**Rich Text Implementation Options:**

**Option A: ContentEditable (No dependencies)**
- Use `<div contenteditable="true">` with rendered HTML
- Native browser editing capabilities
- Simplest implementation

**Option B: Minimal Rich Text Library**
- Consider Quill.js or similar lightweight editor
- Better formatting control
- More user-friendly editing

**Required Features:**
- Display rendered HTML from Markdown
- Allow in-place editing
- "Copy as HTML" button for clipboard
- "Regenerate" button (new API call with same transcript)
- "Save" button (store to localStorage history)

---

## Phase 6: User Interface

### 6.1 Application Layout
**Single-Page Layout (No routing needed):**

```
┌─────────────────────────────────────────┐
│  Veterinary SOAP Note Generator         │
│  [Settings Icon]                        │
├─────────────────────────────────────────┤
│  Step 1: Record Consultation            │
│  [Start Recording] [Stop Recording]     │
│  Status: Ready | Recording: 00:42       │
├─────────────────────────────────────────┤
│  Step 2: Review Transcript              │
│  ┌─────────────────────────────────┐   │
│  │ [Editable transcript text]      │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  [Re-record] [Generate SOAP Note]      │
├─────────────────────────────────────────┤
│  Step 3: SOAP Note                      │
│  ┌─────────────────────────────────┐   │
│  │ [Editable SOAP note HTML]       │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  [Regenerate] [Copy as HTML] [Save]    │
└─────────────────────────────────────────┘
```

**Settings Panel (Modal or Sidebar):**
- API Key input field (password type)
- Test API key button
- Gemini model selection
- System prompt editor
- Clear history button

### 6.2 State Management
**Application States:**
- `IDLE` - Ready to record
- `RECORDING` - Audio recording in progress
- `TRANSCRIBING` - API call for transcription
- `TRANSCRIPT_READY` - Transcript editable
- `GENERATING_SOAP` - API call for SOAP generation
- `SOAP_READY` - SOAP note ready for copy

**State Transitions:**
- Clear visual indicators for each state
- Disable irrelevant buttons in each state
- Loading spinners for API calls
- Error state handling with retry options

### 6.3 Visual Design (Professional, Minimal)
**Design Principles:**
- Clean, high-contrast layout
- Professional medical aesthetic
- Clear typography (readable fonts, adequate sizing)
- Muted color palette (whites, grays, accent blue/green)
- No animations or transitions (stability focus)
- Responsive but desktop-primary (veterinarians typically use desktop/laptop)

**CSS Approach:**
- Custom CSS with CSS variables for theming
- No framework needed (minimal styling requirements)
- Mobile-friendly fallback (single column on small screens)

---

## Phase 7: Critical Features

### 7.1 Data Persistence & Recovery
- Auto-save transcript and SOAP note to localStorage during editing
- Session recovery on accidental page refresh
- "Clear Session" button to start fresh
- Optional: History of last N sessions with timestamps

### 7.2 Copy to Clipboard
**HTML Copy Implementation:**
```javascript
// Copy rendered HTML to clipboard for pasting into EMR
navigator.clipboard.write([
  new ClipboardItem({
    'text/html': new Blob([htmlContent], { type: 'text/html' }),
    'text/plain': new Blob([plainText], { type: 'text/plain' })
  })
]);
```
- Fallback for browsers without ClipboardItem support
- User feedback on successful copy
- Include both HTML and plain text for compatibility

### 7.3 Error Handling & Validation
**Critical Error Scenarios:**
- No API key configured → Prompt user to add key
- Invalid API key → Clear error message, link to settings
- Network failure → Retry option, save data locally
- Audio recording failure → Microphone permission troubleshooting
- API rate limiting → Clear message, wait period indicator
- Malformed API response → Graceful degradation, show raw response

**User-Friendly Error Messages:**
- No technical jargon
- Clear action items for resolution
- Contact/support information (GitHub issues link)

---

## Phase 8: Testing & Quality Assurance

### 8.1 Functional Testing
**Test Cases:**
- Complete workflow: Record → Transcribe → Generate → Copy
- API key configuration and validation
- Transcript editing and persistence
- SOAP note regeneration with different prompts
- Copy to clipboard functionality
- Session recovery after page refresh
- Various audio recording lengths
- Error scenarios (network failures, invalid keys)

### 8.2 Browser Compatibility
**Target Browsers:**
- Chrome/Edge (primary - best MediaRecorder support)
- Firefox (secondary)
- Safari (tertiary - test MediaRecorder compatibility)

**Compatibility Checks:**
- MediaRecorder API availability
- Clipboard API support
- LocalStorage functionality
- Audio format compatibility

### 8.3 Performance & Reliability
- Test with realistic consultation lengths (5-15 minutes)
- Verify audio quality sent to API
- Validate transcription accuracy with veterinary terminology
- Ensure SOAP note formatting consistency
- Check localStorage size limits (quotas)

---

## Phase 9: Deployment

### 9.1 GitHub Pages Setup
**Build Process:**
- `npm run build` creates production bundle in `dist/`
- Webpack minifies and optimizes JS
- Copy static assets (HTML, CSS, icons)
- Generate sourcemaps for debugging (optional)

**Deployment Steps:**
1. Create `gh-pages` branch or use `docs/` folder
2. Configure GitHub repository settings for Pages
3. Push built files to deployment target
4. Configure custom domain (optional)
5. Verify HTTPS is enabled

**File Structure for Deployment:**
```
dist/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js (bundled)
├── favicon.ico
├── icon.svg
└── robots.txt
```

### 9.2 Documentation
**User Documentation (README.md):**
- Purpose and workflow overview
- How to obtain Gemini API key
- Initial setup instructions
- Usage guide with screenshots
- Troubleshooting common issues
- Privacy and data handling explanation

**Technical Documentation:**
- Installation for development
- Build process
- Module architecture
- Customization guide (prompts, models)
- API usage and costs

### 9.3 Maintenance Considerations
- Version number in UI for troubleshooting
- Changelog tracking
- GitHub Issues for bug reports
- Update process for dependencies
- Gemini API version monitoring

---

## Implementation Priority Order

### Phase 1 (Foundation)
1. Set up project dependencies (Gemini SDK, marked.js)
2. Create module structure files
3. Implement localStorage wrapper
4. Build Gemini API client with transcription and generation functions
5. Create basic HTML layout and CSS

### Phase 2 (Core Features)
6. Implement audio recording with MediaRecorder
7. Build transcription workflow (audio → Gemini → editable text)
8. Implement SOAP generation (transcript + prompt → Gemini → Markdown)
9. Add Markdown to HTML rendering
10. Create editable SOAP note display (contenteditable)

### Phase 3 (Polish & Deploy)
11. Add copy-to-clipboard functionality
12. Implement state management and UI flow
13. Build settings panel (API key, system prompt)
14. Add error handling throughout
15. Test complete workflow
16. Deploy to GitHub Pages

---

## Technical Specifications

### Dependencies
**Required:**
- `@google/generative-ai` - Official Gemini SDK
- `marked` - Markdown to HTML (or use simpler alternative: `showdown`, `micromark`)

**Optional:**
- `dompurify` - Sanitize HTML from Markdown (if security concern)
- Lightweight rich text editor (evaluate need after contenteditable testing)

### Browser APIs Used
- MediaRecorder API (audio recording)
- getUserMedia API (microphone access)
- Clipboard API (copy HTML)
- LocalStorage API (data persistence)
- Fetch API (if Gemini SDK doesn't handle all requests)

### Gemini API Configuration
**Models:**
- Primary: `gemini-2.5-flash` (fast, cost-effective for transcription)
- Alternative: `gemini-2.5-pro` (higher quality for SOAP analysis)

**API Capabilities Used:**
- Audio input (multimodal transcription)
- Text generation (SOAP note generation)
- Streaming (optional for faster perceived performance)

---

## Security & Privacy

### Data Handling
- **No server-side storage** - All data remains in browser
- API key stored in localStorage (plain text - acceptable for single-user tool)
- Session data optionally cached locally
- No analytics or tracking
- No data leaves user's machine except API calls to Google

### Privacy Considerations
- HIPAA compliance note: This is a tool for creating notes, not storing PHI
- User responsible for securing their device
- Clear documentation about local storage

---

## Future Enhancements (Post-Launch)

### Potential Features (Low Priority)
1. Multiple system prompt templates (different note styles)
2. Keyboard shortcuts for power users
3. Custom vocabulary/terminology additions for better transcription

---

## Success Criteria

**Primary Goals:**
- ✓ Record audio from browser microphone
- ✓ Accurate transcription of veterinary consultations
- ✓ Generate properly formatted SOAP notes
- ✓ Copy SOAP notes as HTML to clipboard
- ✓ Stable, reliable operation for daily clinical use
- ✓ Simple setup with Gemini API key

**Quality Metrics:**
- Zero data loss (auto-save, recovery)
- <5 second transcription time for 5-minute audio
- <3 second SOAP generation time
- 100% clipboard copy success rate
- Clear error messages for all failure modes

**User Satisfaction:**
- Reduces time to create SOAP notes vs. manual typing
- Accuracy of transcription and SOAP generation
- Seamless integration into clinical workflow
- No technical barriers to daily use

---

## Notes & Assumptions

- User has modern browser (Chrome recommended)
- User has stable internet connection during recording sessions
- Audio quality sufficient from standard laptop/desktop microphone
- Gemini API provides adequate veterinary terminology recognition
- User comfortable with basic web application usage
- GitHub Pages sufficient for hosting (no backend needed)
- API costs acceptable for 1-2 users (~$10-20/month estimated)

---

## Developer Checklist

### Before Starting
- [ ] Obtain Gemini API key for testing
- [ ] Test audio recording in target browsers
- [ ] Verify Gemini audio transcription quality
- [ ] Confirm Markdown rendering approach
- [ ] Test clipboard HTML copy in target browsers

### During Development
- [ ] Commit regularly to version control
- [ ] Test each module independently
- [ ] Document any API quirks or limitations
- [ ] Keep bundle size minimal
- [ ] Test on actual target hardware/browsers

### Before Deployment
- [ ] End-to-end workflow testing
- [ ] Error scenario testing
- [ ] Performance testing with realistic audio lengths
- [ ] Cross-browser compatibility verification
- [ ] Documentation complete and accurate
- [ ] Privacy/security review
- [ ] Create tagged release version

---

## Support & Resources

**Gemini API Documentation:**
- https://ai.google.dev/docs
- Audio input: https://ai.google.dev/docs/multimodal
- API pricing: https://ai.google.dev/pricing

**Browser APIs:**
- MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API

**Deployment:**
- GitHub Pages: https://pages.github.com/

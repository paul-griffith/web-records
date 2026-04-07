# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Veterinary Record Assistant - A client-side web application using TypeScript, Preact, and Google Gemini AI for recording veterinary consultations, transcribing audio, and generating structured notes. Templates are general-purpose and cover SOAP notes, intake histories, inpatient plans, wellness exams, and more.

## Development Commands

### Essential Commands
- `npm install` - Install dependencies
- `npm start` - Start development server on http://localhost:8081
- `npm run build` - Build production bundle to `dist/`

### No Test Suite
Currently no tests are configured (test script exits with error).

## Architecture

### Technology Stack
- **Framework**: Preact (React alternative) with TypeScript
- **AI Integration**: Google Gemini API (`@google/genai`) for audio transcription and text generation
- **Build System**: Webpack with separate dev/prod configs
- **State Management**: Preact hooks (useState, useEffect) - no external state library

### Key Architectural Patterns

**1. Component-Based UI (`src/components/`)**
- `App.tsx` - Root component, manages global state and orchestrates workflow
- `TranscriptSection.tsx` - Left column: recording controls + transcript editing
- `AnalysisSection.tsx` - Right column: template selection + note generation/editing
- `Header.tsx` - Floating settings button (top-right corner)
- `AlertContainer.tsx` - Toast-style notifications (top-center)
- `SettingsModal.tsx` - API key and system prompt configuration
- Shared components in `src/components/shared/` (Button, Loading)

**2. Module Layer (`src/modules/`)**
Core business logic modules:
- `audio-recorder.ts` - MediaRecorder API wrapper for browser audio capture
- `gemini-client.ts` - Gemini API client with methods for transcription and SOAP generation
- `storage.ts` - LocalStorage abstraction for API keys, prompts, session data, template selection

**2a. Content Layer (`src/content/`)**
- `templates.ts` - Template definitions; each template bundles a `systemPrompt` (AI behavior) and `content` (output structure/skeleton)
- `abbreviations.ts` - Clinic-specific abbreviation map passed to both transcription and generation prompts
- `prompt.ts` - `DEFAULT_PROMPT` fallback used when no template is selected
- `transcription-prompt.ts` - System instruction for audio transcription (extracted for easy editing)
- Templates are embedded in source code (not user-editable at runtime) but straightforward to extend
- Template selection persists across page reloads via localStorage

**3. Two-Column Layout**
- Fixed two-column grid layout (50/50 split) optimized for laptop screens
- Left column: Recording controls integrated with transcript editor
- Right column: Template selector with generated note editor
- Fixed headers/footers with scrollable content areas
- Always visible - no progressive disclosure

**4. Application State Flow**
The app follows a strict state machine (see `AppState` enum in `src/types/index.ts`):
```
IDLE → RECORDING → TRANSCRIBING → TRANSCRIPT_READY → GENERATING → ANALYSIS_READY
```
State is managed in `App.tsx` and propagated to child components via props.

**5. Insert-Based Transcription**
- Recordings insert at cursor position in textarea, not replace entire content
- Allows natural start/stop workflow for long consultations
- Easy correction by re-recording over mistakes
- Cursor position tracked via textarea ref and callbacks

**6. Session Persistence**
- Template selection persists to localStorage and is restored on page reload (including its system prompt and structure)
- Transcript and generated note are session-only (not persisted)

**7. Model Configuration**
- Transcription model: `gemini-2.5-flash` (defined in `gemini-client.ts`)
- Note generation model: `gemini-2.5-pro` (defined in `gemini-client.ts`)
- API key stored in localStorage (client-side only, no backend)

### Module Responsibilities

**GeminiClient (`src/modules/gemini-client.ts`)**
- Converts audio Blob to base64 for API
- Handles MIME type compatibility
- Uses veterinary abbreviations from `abbreviations.ts` in prompts
- Two main operations:
  - `transcribeAudio()` - Sends audio with system instruction for transcription
  - `generateNote()` - Converts transcript to structured note with optional template context
- Error handling with user-friendly messages for API key, rate limits, format issues

**AudioRecorder (`src/modules/audio-recorder.ts`)**
- Browser MediaRecorder API wrapper
- Automatically selects best supported audio format (webm/opus preferred)
- Provides duration tracking and cleanup
- Handles permission errors gracefully

**Storage (`src/modules/storage.ts`)**
- Single source of truth for localStorage keys
- Manages:
  - `gemini_api_key` - API key persistence
  - `selected_template` - Template ID, restored on page load

**Abbreviations (`src/content/abbreviations.ts`)**
- Map of veterinary and clinic-specific abbreviations
- Injected into both the transcription prompt and note generation prompt
- Examples: "LBVC", "C/S/V/D", "NPO", "AUS"

### Build Configuration

**Webpack Setup**
- Entry point: `src/index.tsx`
- Output: `dist/js/app.js`
- React aliases point to Preact compat layer for smaller bundle size
- TypeScript compilation via ts-loader
- Separate configs:
  - `webpack.common.js` - Base configuration
  - `webpack.config.dev.js` - Dev server with hot reload
  - `webpack.config.prod.js` - Production optimizations

### Type System

Central types defined in `src/types/index.ts`:
- `AppState` enum - Workflow state machine
- `Session` - Transcript + note data structure
- `AudioData` - Audio blob with metadata
- `StorageKeys` - LocalStorage key definitions (`API_KEY`, `SELECTED_TEMPLATE`)
- `Template` - Template structure (`name`, `systemPrompt`, `content`)
- `AlertType` - UI notification types

## Important Implementation Notes

### Gemini API Usage
- Uses `@google/genai` v0.3.1+
- API structure: `genAI.models.generateContent()` with `config.systemInstruction`
- Transcription model: `gemini-2.5-flash`; note generation model: `gemini-2.5-pro`
- Transcription prompt lives in `src/content/transcription-prompt.ts`
- Note generation uses the template's `systemPrompt` as `systemInstruction`, with transcript and optional template `content` as user message parts

### Template System Implementation
- Templates defined in `src/content/templates.ts` as a `Map<string, Template>`
- Each template has: `name` (display), `systemPrompt` (AI behavior), `content` (output skeleton)
- **Selecting a template sets both the system prompt and the structure textarea** — this is the primary way to switch between note types (SOAP, intake history, wellness, etc.)
- Flow: user selects template → `handleTemplateChange` in `App.tsx` sets `systemPrompt`, `templateBody`, and persists ID to localStorage → on next load, template is restored from `Storage.getSelectedTemplate()`
- System prompt remains editable in the UI for per-session tweaks after template selection
- Template `content` is passed to `generateNote()` as an additional user message part; empty content (id: `'none'`) skips injection
- Built-in templates: No Template, SOAP Note, Intake/History, Inpatient Assessment, Inpatient Plan, Canine Wellness, Feline Wellness, Kitten Plan

### Audio Handling
- Supports WebM, MP3, WAV, OGG (in order of preference)
- Browser requests echo cancellation, noise suppression, auto gain control
- Chunks collected via `ondataavailable` event, combined into single Blob on stop

### LocalStorage Schema
Keys managed by Storage module:
- `gemini_api_key` - User's API key (plain text)
- `selected_template` - Template ID (defaults to `'none'`)

### Privacy & Security Model
- All processing client-side (no backend server)
- API key stored in browser localStorage (not encrypted)
- No PHI storage (sessions are temporary)
- Users bring their own Gemini API key

## Common Development Patterns

### Adding a New Component
1. Create in `src/components/` with TypeScript + Preact
2. Import necessary hooks from `preact/hooks`
3. Define props interface
4. Connect to App.tsx via props/callbacks

### Modifying State Flow
1. Update `AppState` enum in `src/types/index.ts` if adding new states
2. Update state transitions in `App.tsx` handlers
3. Update component conditional rendering based on appState

### Adding or Modifying Templates
1. Edit `src/content/templates.ts`
2. Add a new entry to the `TEMPLATES` map with a unique string key
3. Include:
   - `name` - display text in the dropdown
   - `systemPrompt` - the AI behavior instruction for this note type
   - `content` - Markdown skeleton shown in the template editor (can be empty)
4. Template content guides structure but doesn't force exact format (AI interprets)
5. Consider clinic-specific abbreviations from `src/content/abbreviations.ts`

### Changing Gemini Prompts
- **Transcription prompt**: `src/content/transcription-prompt.ts` — edit `TRANSCRIPTION_PROMPT`
- **Per-template system prompts**: `src/content/templates.ts` — edit each template's `systemPrompt` field
- **Default system prompt** (no template): `src/content/prompt.ts` — edit `DEFAULT_PROMPT`

### Component Communication Patterns
**Cursor Position Tracking** (TranscriptSection → App):
- TranscriptSection uses textarea ref to track cursor position
- Passes callback functions `getCursorPosition()` and `setSelectionRange()` to parent handlers
- Parent (App) uses these to insert transcribed text at correct position
- Alternative to forwardRef pattern (which has typing issues in Preact)

### UI Layout Architecture

**CSS Organization**:
- `css/base.css` (267 lines) - HTML5 Boilerplate foundation, helper classes, print styles
- `css/app.css` (1039 lines) - Application-specific styles organized by component

**Two-Column Grid Layout** (defined in `css/app.css`):
- `.app-container` - Full viewport height flexbox container
- `.two-column-layout` - CSS Grid with `1fr 1fr` columns
- `.left-column` / `.right-column` - Flexbox columns with fixed headers/footers
- `.transcript-editor` / `.soap-editor` - Scrollable content areas with `flex: 1` and `min-height: 0`
- `.settings-button` - Fixed position (top-right) floating button
- `.alert-container` - Fixed position (bottom-center) toast notifications

**Rich Text Editor** (AnalysisSection):
- Uses native `contentEditable` div for WYSIWYG editing
- Formatting toolbar with Bold, Italic, Underline, Lists, Headings, Undo/Redo
- Real-time word/character count
- Implemented via `RichTextEditor` class in `src/utils/rich-text-editor.ts`
- Markdown from AI converted to HTML via `marked` library

### Testing API Changes
Use the Settings modal's "Test" button - calls `GeminiClient.testApiKey()` which makes a minimal API request to validate the key.

## Deployment

### GitHub Pages (Automatic)
- GitHub Action in `.github/workflows/deploy.yml`
- Triggers on push to `main`
- Builds production bundle and deploys to Pages
- Enable in repo Settings > Pages > Source: GitHub Actions

### Manual Deployment
```bash
npm run build
git subtree push --prefix dist origin gh-pages
```

## Known Limitations

- No backend storage (all data ephemeral unless saved to EMR)
- API key stored in plain text in localStorage
- No offline support (requires Gemini API)
- Limited browser compatibility (Chrome/Firefox recommended)
- No test coverage currently implemented

## Obsolete Files (Safe to Delete)

- `src/components/RecordingSection.tsx` - Recording functionality moved to TranscriptSection
- `dist/src/components/RecordingSection.d.ts` - Build artifact from old component
- `dist/src/components/SOAPSection.d.ts` - Build artifact from renamed component (now AnalysisSection)

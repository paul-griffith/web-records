# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Veterinary SOAP Note Generator - A client-side web application using TypeScript, Preact, and Google Gemini AI for recording veterinary consultations, transcribing audio, and generating structured SOAP notes.

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
- Components organized by feature (Recording, Transcript, SOAP, Settings, etc.)
- Shared components in `src/components/shared/`

**2. Module Layer (`src/modules/`)**
Core business logic modules:
- `audio-recorder.ts` - MediaRecorder API wrapper for browser audio capture
- `gemini-client.ts` - Gemini API client with methods for transcription and SOAP generation
- `storage.ts` - LocalStorage abstraction for API keys, prompts, session data, template selection

**2a. Template System (`src/templates/`)**
- `soap-templates.ts` - Predefined SOAP note templates (wellness exams, sick visits, dental, surgery, rechecks, clinic-specific formats)
- Templates provide structured formats and example sections for different visit types
- Selected template content is passed to Gemini during SOAP generation as additional context
- Templates are embedded in source code (not user-editable) but can be extended by developers

**3. Application State Flow**
The app follows a strict state machine (see `AppState` enum in `src/types/index.ts`):
```
IDLE → RECORDING → TRANSCRIBING → TRANSCRIPT_READY → GENERATING_SOAP → SOAP_READY
```
State is managed in `App.tsx` and propagated to child components via props.

**4. Session Persistence**
- Current session auto-saves to localStorage as user progresses
- Session history keeps last 50 completed sessions
- Recovery on page reload via `Storage.getCurrentSession()`

**5. Model Configuration**
- Separate model selection for transcription (default: gemini-2.5-flash) and SOAP generation (default: gemini-2.5-pro)
- Configurable system prompts stored in localStorage
- API key stored in localStorage (client-side only, no backend)

### Module Responsibilities

**GeminiClient (`src/modules/gemini-client.ts`)**
- Converts audio Blob to base64 for API
- Handles MIME type compatibility
- Two main operations:
  - `transcribeAudio()` - Sends audio with system instruction for transcription
  - `generateSOAP()` - Converts transcript to structured SOAP note
- Error handling with user-friendly messages for API key, rate limits, format issues

**AudioRecorder (`src/modules/audio-recorder.ts`)**
- Browser MediaRecorder API wrapper
- Automatically selects best supported audio format (webm/opus preferred)
- Provides duration tracking and cleanup
- Handles permission errors gracefully

**Storage (`src/modules/storage.ts`)**
- Single source of truth for localStorage keys
- Manages:
  - API key persistence
  - System prompt (with default template)
  - Model selection (transcription vs SOAP)
  - Template selection (by ID)
  - Current session (for recovery)
  - Session history (up to 50 entries)

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
- `Session` - Transcript + SOAP data structure
- `AudioData` - Audio blob with metadata
- `StorageKeys` - LocalStorage key definitions
- `SOAPTemplate` - Template structure (id, name, description, content)
- `AlertType` - UI notification types

## Important Implementation Notes

### Gemini API Usage
- Uses `@google/genai` v0.3.1+ (newer SDK as of recent migration)
- API structure: `genAI.models.generateContent()` with `config.systemInstruction`
- Both transcription and SOAP generation use same API pattern but different models
- Transcription prompt includes veterinary terminology guidance and formatting rules
- SOAP generation optionally includes template content as context before the transcript
- Commented-out `thinkingConfig` in SOAP generation (line 150-152) - experimental feature

### Template System Implementation
- Templates defined as array in `src/templates/soap-templates.ts`
- Each template has: unique ID, display name, description, markdown content
- Template selection stored in localStorage via `Storage.getSelectedTemplate()`
- Flow: User selects template in Settings → ID stored → Template content retrieved during SOAP generation → Content prepended to user prompt
- Template content guides structure but doesn't force exact format (AI interprets)
- Default "No Template" option (id: 'none') bypasses template injection
- Built-in templates: Basic Wellness, Sick Visit, Dental, Surgery Consult, Recheck, LBVC Standard

### Audio Handling
- Supports WebM, MP3, WAV, OGG (in order of preference)
- Browser requests echo cancellation, noise suppression, auto gain control
- Chunks collected via `ondataavailable` event, combined into single Blob on stop

### LocalStorage Schema
Keys managed by Storage module:
- `gemini_api_key` - User's API key (plain text)
- `system_prompt` - SOAP generation instructions
- `model_transcription` - Model for audio→text
- `model_soap` - Model for transcript→SOAP
- `selected_template` - Template ID (defaults to 'none')
- `current_session` - Auto-save for recovery
- `session_history` - Array of completed sessions

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
1. Edit `src/templates/soap-templates.ts`
2. Add new object to `SOAP_TEMPLATES` array with unique ID
3. Include: id, name (display text), description (help text), content (markdown format)
4. Template content should show example structure, not rigid requirements
5. Consider clinic-specific abbreviations and formatting conventions

### Changing Gemini Prompts
Default prompts are in `src/modules/`:
- Transcription: Hardcoded in `gemini-client.ts:62-66`
- SOAP generation: `storage.ts:18-26` (DEFAULT_SYSTEM_PROMPT)
- Templates: Separate from system prompt, defined in `src/templates/soap-templates.ts`

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

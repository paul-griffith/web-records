# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Veterinary Analaysis Generator - A client-side web application using TypeScript, Preact, and Google Gemini AI for recording veterinary consultations, transcribing audio, and generating structured responses.

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

**2a. Template System (`src/templates/`)**
- `templates.ts` - Predefined SOAP note templates (wellness exams, sick visits, dental, surgery, rechecks, clinic-specific formats)
- Templates provide structured formats and example sections for different visit types
- Selected template content is passed to Gemini during SOAP generation as additional context
- Templates are embedded in source code (not user-editable) but can be extended by developers

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
- Current session auto-saves to localStorage as user progresses
- Session history keeps last 50 completed sessions
- Recovery on page reload via `Storage.getCurrentSession()`

**7. Model Configuration**
- Separate model selection for transcription (default: gemini-2.5-flash) and SOAP generation (default: gemini-2.5-pro)
- Configurable system prompts stored in localStorage
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
  - API key persistence
  - System prompt (with default template)
  - Template selection (by ID) - selected in AnalysisSection, stored for persistence
  - Current session (for recovery)
  - Session history (up to 50 entries)

**Abbreviations (`src/modules/abbreviations.ts`)**
- Map of veterinary and clinic-specific abbreviations
- Used in both transcription and note generation prompts
- Helps AI understand domain-specific terminology
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
- Templates defined as array in `src/templates/templates.ts`
- Each template has: unique ID, display name, description, markdown content
- Template selection stored in localStorage via `Storage.getSelectedTemplate()`
- Flow: User selects template in AnalysisSection → ID stored → Template content retrieved during note generation → Content prepended to user prompt
- Template content guides structure but doesn't force exact format (AI interprets)
- Default "No Template" option (id: 'none') bypasses template injection
- Built-in templates: No Template, Inpatient Assessment, Inpatient Plan, Canine/Feline Wellness, Kitten Plan

### Audio Handling
- Supports WebM, MP3, WAV, OGG (in order of preference)
- Browser requests echo cancellation, noise suppression, auto gain control
- Chunks collected via `ondataavailable` event, combined into single Blob on stop

### LocalStorage Schema
Keys managed by Storage module:
- `gemini_api_key` - User's API key (plain text)
- `system_prompt` - Note generation instructions
- `selected_template` - Template ID (defaults to 'none')
- `current_session` - Auto-save for recovery
- `session_history` - Array of completed sessions

Session object structure:
```typescript
{
  transcript?: string;
  soap?: string;          // Markdown version
  soapHTML?: string;      // HTML version
  state?: AppState;
  timestamp?: string;
}
```

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
1. Edit `src/templates/templates.ts`
2. Add new object to `SOAP_TEMPLATES` array with unique ID
3. Include: id, name (display text), description (help text), content (markdown format)
4. Template content should show example structure, not rigid requirements
5. Consider clinic-specific abbreviations and formatting conventions

### Changing Gemini Prompts
Default prompts are in `src/modules/`:
- Transcription: Hardcoded in `gemini-client.ts` (~line 62-66)
- Note generation: `storage.ts` DEFAULT_SYSTEM_PROMPT (~line 18-26)
- Templates: Separate from system prompt, defined in `src/templates/templates.ts`

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

These files exist but are no longer used in the current implementation:
- `src/components/RecordingSection.tsx` - Recording functionality moved to TranscriptSection
- `dist/src/components/RecordingSection.d.ts` - Build artifact from old component
- `dist/src/components/SOAPSection.d.ts` - Build artifact from renamed component (now AnalysisSection)

See `CLEANUP_PLAN.md` for detailed removal instructions.

## Related Documentation

- `CURRENT_STATE.md` - Comprehensive snapshot of current application architecture, data flows, and implementation details
- `CLEANUP_PLAN.md` - Detailed plan for removing obsolete files and cruft from previous implementations

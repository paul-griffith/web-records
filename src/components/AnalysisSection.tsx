import { useEffect, useRef } from 'preact/hooks';
import type { JSX } from 'preact';
import { Button } from './shared/Button';
import { Loading } from './shared/Loading';
import { AppState } from '../types';
import { RichTextEditor } from '../utils/rich-text-editor';
import {TEMPLATES} from '../templates/templates';

interface AnalysisProps {
  appState: AppState;
  soapHTML: string;
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  onGenerateSOAP: () => Promise<void>;
  onCopy: (html: string, text: string) => Promise<void>;
  onSave: (html: string) => void;
}

export function AnalysisSection({
  appState,
  soapHTML,
  selectedTemplate,
  onTemplateChange,
  onGenerateSOAP,
  onCopy,
  onSave
}: AnalysisProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const richTextEditorRef = useRef<RichTextEditor | null>(null);

  const isGenerating = appState === AppState.GENERATING;
  const isTranscriptReady = appState === AppState.TRANSCRIPT_READY || appState === AppState.ANALYSIS_READY;
  const hasContent = soapHTML.length > 0;

  // Initialize RichTextEditor when component mounts
  useEffect(() => {
    if (editorRef.current && toolbarRef.current && statsRef.current && !richTextEditorRef.current) {
      richTextEditorRef.current = new RichTextEditor(
        editorRef.current,
        toolbarRef.current,
        statsRef.current
      );
    }
  }, []);

  // Update editor content when soapHTML changes
  useEffect(() => {
    if (richTextEditorRef.current && soapHTML) {
      richTextEditorRef.current.setHTML(soapHTML);
    }
  }, [soapHTML]);

  const handleTemplateChange = (e: JSX.TargetedEvent<HTMLSelectElement>) => {
    onTemplateChange(e.currentTarget.value);
  };

  const handleCopy = async () => {
    if (richTextEditorRef.current) {
      const html = richTextEditorRef.current.getHTML();
      const text = richTextEditorRef.current.getText();
      await onCopy(html, text);
    }
  };

  const handleSave = () => {
    if (richTextEditorRef.current) {
      const html = richTextEditorRef.current.getHTML();
      onSave(html);
    }
  };

  return (
    <div className="soap-section">
      {/* Fixed header with template selector and generate button */}
      <div className="soap-header">
        <h2>SOAP Note</h2>
        <div className="template-selector">
          <select
            id="template-select"
            className="input-field"
            value={selectedTemplate}
            onChange={handleTemplateChange}
          >
            {[...TEMPLATES.entries()].map(([id, template]) => (
              <option key={id} value={id}>
                {template.name}
              </option>
            ))}
          </select>
          <Button
            className="btn btn-primary"
            onClick={onGenerateSOAP}
            disabled={!isTranscriptReady || isGenerating}
          >
            {hasContent ? 'Regenerate' : 'Generate SOAP Note'}
          </Button>
        </div>
      </div>

      {isGenerating && (
        <Loading message="Generating SOAP note..." />
      )}

      {!isGenerating && (
        <div className="soap-content">
          {/* Formatting Toolbar */}
          <div id="soap-toolbar" className="editor-toolbar" ref={toolbarRef}>
            <div className="toolbar-group">
              <button type="button" className="toolbar-btn" data-command="bold" title="Bold (Ctrl+B)">
                <strong>B</strong>
              </button>
              <button type="button" className="toolbar-btn" data-command="italic" title="Italic (Ctrl+I)">
                <em>I</em>
              </button>
              <button type="button" className="toolbar-btn" data-command="underline" title="Underline (Ctrl+U)">
                <u>U</u>
              </button>
            </div>
            <div className="toolbar-separator"></div>
            <div className="toolbar-group">
              <button type="button" className="toolbar-btn" data-command="insertUnorderedList" title="Bullet List">
                • List
              </button>
              <button type="button" className="toolbar-btn" data-command="insertOrderedList" title="Numbered List">
                1. List
              </button>
            </div>
            <div className="toolbar-separator"></div>
            <div className="toolbar-group">
              <button type="button" className="toolbar-btn" data-command="formatBlock" data-value="h2" title="Heading">
                H
              </button>
              <button type="button" className="toolbar-btn" data-command="formatBlock" data-value="p" title="Paragraph">
                P
              </button>
            </div>
            <div className="toolbar-separator"></div>
            <div className="toolbar-group">
              <button type="button" className="toolbar-btn" data-command="undo" title="Undo (Ctrl+Z)">
                ↶
              </button>
              <button type="button" className="toolbar-btn" data-command="redo" title="Redo (Ctrl+Y)">
                ↷
              </button>
            </div>
            <div className="toolbar-separator"></div>
            <div className="toolbar-group">
              <button type="button" id="clean-formatting-btn" className="toolbar-btn" title="Clean Formatting">
                Clear Format
              </button>
            </div>
          </div>

          {/* Editor */}
          <div
            id="soap-editor"
            className="soap-editor"
            contentEditable={true}
            ref={editorRef}
          ></div>

          {/* Character/Word Count */}
          <div className="editor-stats" ref={statsRef}>
            <span id="word-count">0 words</span>
            <span className="separator">•</span>
            <span id="char-count">0 characters</span>
          </div>

          {/* Fixed footer with action buttons */}
          <div className="soap-footer">
            <Button
              className="btn btn-success"
              onClick={handleCopy}
              disabled={!hasContent}
            >
              Copy as HTML
            </Button>
            <Button
              className="btn btn-secondary"
              onClick={handleSave}
              disabled={!hasContent}
            >
              Save to History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef } from 'preact/hooks';
import type {TargetedEvent} from 'preact';
import { Button } from './shared/Button';
import { Loading } from './shared/Loading';
import { AppState } from '../types';
import { RichTextEditor } from '../utils/rich-text-editor';
import {TEMPLATES} from '../content/templates';

interface AnalysisProps {
  appState: AppState;
  soapHTML: string;
  selectedTemplate: string;
  systemPrompt: string;
  templateBody: string;
  onPromptChange: (systemPrompt: string, template: string) => void;
  onTemplateChange: (templateId: string) => void;
  onGenerateSOAP: () => Promise<void>;
  onCopy: (html: string, text: string) => Promise<void>;
}

export function AnalysisSection({
  appState,
  soapHTML,
  selectedTemplate,
  systemPrompt,
  templateBody,
  onPromptChange,
  onTemplateChange,
  onGenerateSOAP,
  onCopy,
}: AnalysisProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const richTextEditorRef = useRef<RichTextEditor | null>(null);

  const isGenerating = appState === AppState.GENERATING;
  const isTranscriptReady = appState === AppState.TRANSCRIPT_READY || appState === AppState.ANALYSIS_READY;
  const hasContent = soapHTML.length > 0;

  // Initialize RichTextEditor when component mounts
  useEffect(() => {
    if (editorRef.current && toolbarRef.current && !richTextEditorRef.current) {
      richTextEditorRef.current = new RichTextEditor(
        editorRef.current,
        toolbarRef.current
      );
    }
  }, []);

  // Update editor content when soapHTML changes
  useEffect(() => {
    if (richTextEditorRef.current && soapHTML) {
      richTextEditorRef.current.setHTML(soapHTML);
    }
  }, [soapHTML]);

  const handleTemplateChange = (e: TargetedEvent<HTMLSelectElement>) => {
    onTemplateChange(e.currentTarget.value);
  };

  const handleCopy = async () => {
    if (richTextEditorRef.current) {
      const html = richTextEditorRef.current.getHTML();
      const text = richTextEditorRef.current.getText();
      await onCopy(html, text);
    }
  };

  return (
    <div className="soap-section">
      {/* Fixed header with template selector and generate button */}
      <div className="soap-header">
        {/* System Prompt Editor */}
        <div className="form-group">
          <textarea
            id="system-prompt-editor"
            className="input-field"
            rows={6}
            value={systemPrompt}
            onInput={(e: TargetedEvent<HTMLTextAreaElement>) => onPromptChange(e.currentTarget.value, templateBody)}
          />
        </div>
      </div>

      {isGenerating && (
        <Loading message="Generating..." />
      )}

      <div className="soap-content">
        <div className="form-group">
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
          <textarea
            id="template-editor"
            className="input-field"
            rows={6}
            value={templateBody}
            onInput={(e: TargetedEvent<HTMLTextAreaElement>) => onPromptChange(systemPrompt, e.currentTarget.value)}
          />
        </div>

        <Button
          className="btn btn-primary"
          onClick={onGenerateSOAP}
          disabled={!isTranscriptReady || isGenerating}
        >
          {hasContent ? 'Regenerate' : 'Generate'}
        </Button>

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

        {/* Fixed footer with action buttons */}
        <div className="soap-footer">
          <Button
            className="btn btn-primary"
            onClick={handleCopy}
            disabled={!hasContent}
          >
            Copy to Clipboard
          </Button>
        </div>
      </div>
    </div>
  );
}

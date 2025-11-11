/**
 * SOAP note section component with rich text editor
 */

import { useEffect, useRef } from 'preact/hooks';
import { Button } from './shared/Button';
import { Loading } from './shared/Loading';
import { AppState } from '../types';
import { RichTextEditor } from '../utils/rich-text-editor';

interface SOAPSectionProps {
  appState: AppState;
  soapHTML: string;
  onRegenerate: () => Promise<void>;
  onCopy: (html: string, text: string) => Promise<void>;
  onSave: (html: string) => void;
}

export function SOAPSection({
  appState,
  soapHTML,
  onRegenerate,
  onCopy,
  onSave
}: SOAPSectionProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const richTextEditorRef = useRef<RichTextEditor | null>(null);

  const isGenerating = appState === AppState.GENERATING_SOAP;
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
    <section id="step-soap" className="card">
      <h2>SOAP Note</h2>

      {isGenerating && (
        <Loading message="Generating SOAP note..." />
      )}

      {!isGenerating && (
        <div id="soap-content">
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

          <div className="button-group">
            <Button
              className="btn btn-secondary"
              onClick={onRegenerate}
              disabled={!hasContent}
            >
              Regenerate
            </Button>
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
              Save
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

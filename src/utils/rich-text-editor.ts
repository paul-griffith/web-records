/**
 * Rich text editor utilities for SOAP note editing
 * Provides formatting controls using contenteditable and execCommand
 */

export class RichTextEditor {
  private editor: HTMLElement;
  private toolbar: HTMLElement;
  private stats: HTMLElement | null;
  private wordCountEl: HTMLElement | null = null;
  private charCountEl: HTMLElement | null = null;

  constructor(editorElement: HTMLElement, toolbarElement: HTMLElement, statsElement: HTMLElement | null = null) {
    this.editor = editorElement;
    this.toolbar = toolbarElement;
    this.stats = statsElement;

    if (this.stats) {
      this.wordCountEl = this.stats.querySelector('#word-count');
      this.charCountEl = this.stats.querySelector('#char-count');
    }

    this.init();
  }

  /**
   * Initialize editor
   */
  private init(): void {
    if (!this.editor || !this.toolbar) return;

    // Attach toolbar button handlers
    this.attachToolbarHandlers();

    // Update stats on input
    this.editor.addEventListener('input', () => {
      this.updateStats();
    });

    // Update toolbar button states on selection change
    document.addEventListener('selectionchange', () => {
      if (this.isEditorFocused()) {
        this.updateToolbarState();
      }
    });

    // Keyboard shortcuts
    this.editor.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Prevent default drop behavior to avoid unwanted formatting
    this.editor.addEventListener('drop', (e) => {
      e.preventDefault();
    });

    // Initial stats update
    this.updateStats();
  }

  /**
   * Check if editor is focused
   */
  private isEditorFocused(): boolean {
    return this.editor.contains(document.activeElement);
  }

  /**
   * Attach toolbar button handlers
   */
  private attachToolbarHandlers(): void {
    const buttons = this.toolbar.querySelectorAll('.toolbar-btn[data-command]');

    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const command = button.getAttribute('data-command');
        const value = button.getAttribute('data-value') || null;

        if (command) {
          this.executeCommand(command, value);
          this.editor.focus();
        }
      });
    });

    // Clean formatting button
    const cleanBtn = document.getElementById('clean-formatting-btn');
    if (cleanBtn) {
      cleanBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.cleanFormatting();
      });
    }
  }

  /**
   * Execute formatting command
   */
  private executeCommand(command: string, value: string | null = null): void {
    try {
      document.execCommand(command, false, value || undefined);
      this.updateToolbarState();
    } catch (error) {
      console.error('Command execution failed:', command, error);
    }
  }

  /**
   * Update toolbar button active states
   */
  private updateToolbarState(): void {
    const buttons = this.toolbar.querySelectorAll('.toolbar-btn[data-command]');

    buttons.forEach(button => {
      const command = button.getAttribute('data-command');

      if (command) {
        try {
          const isActive = document.queryCommandState(command);
          button.classList.toggle('active', isActive);
        } catch (error) {
          // Some commands don't support queryCommandState
          button.classList.remove('active');
        }
      }
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyboardShortcuts(e: KeyboardEvent): void {
    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      this.executeCommand('bold');
    }

    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      this.executeCommand('italic');
    }

    // Ctrl/Cmd + U for underline
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      this.executeCommand('underline');
    }

    // Ctrl/Cmd + Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.executeCommand('undo');
    }

    // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z for redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      this.executeCommand('redo');
    }
  }

  /**
   * Clean formatting from selected text
   */
  private cleanFormatting(): void {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedContent = range.extractContents();

    // Get plain text from selection
    const plainText = selectedContent.textContent || '';

    // Create text node and insert
    const textNode = document.createTextNode(plainText);
    range.insertNode(textNode);

    // Restore selection
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    this.editor.focus();
  }

  /**
   * Update word and character count
   */
  private updateStats(): void {
    if (!this.wordCountEl || !this.charCountEl) return;

    const text = this.editor.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = text.trim().length > 0 ? words.length : 0;
    const charCount = text.length;

    this.wordCountEl.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
    this.charCountEl.textContent = `${charCount} character${charCount !== 1 ? 's' : ''}`;
  }

  /**
   * Get clean HTML content
   */
  getHTML(): string {
    return this.editor.innerHTML;
  }

  /**
   * Set HTML content
   */
  setHTML(html: string): void {
    this.editor.innerHTML = html;
    this.updateStats();
  }

  /**
   * Get plain text content
   */
  getText(): string {
    return this.editor.innerText || '';
  }

  /**
   * Clear editor content
   */
  clear(): void {
    this.editor.innerHTML = '';
    this.updateStats();
  }

  /**
   * Insert HTML at cursor
   */
  insertHTML(html: string): void {
    this.executeCommand('insertHTML', html);
  }

  /**
   * Focus the editor
   */
  focus(): void {
    this.editor.focus();
  }
}

/**
 * Clipboard utilities for copying HTML and plain text
 */

/**
 * Clean and format HTML for clipboard
 * Removes unnecessary attributes and ensures clean output
 * @param html - Raw HTML content
 * @returns Cleaned HTML
 */
function cleanHTMLForClipboard(html: string): string {
  // Create temporary element to manipulate HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove contenteditable attributes
  temp.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
  });

  // Remove data attributes that aren't needed
  temp.querySelectorAll('[data-command], [data-value]').forEach(el => {
    el.removeAttribute('data-command');
    el.removeAttribute('data-value');
  });

  // Clean up empty paragraphs
  temp.querySelectorAll('p:empty, div:empty').forEach(el => {
    if (!el.hasChildNodes() || (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 && !el.textContent?.trim())) {
      el.remove();
    }
  });

  // Add basic inline styles for better compatibility with EMR systems
  temp.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.fontWeight = 'bold';
    htmlEl.style.marginTop = '12px';
    htmlEl.style.marginBottom = '6px';

    if (el.tagName === 'H1') htmlEl.style.fontSize = '1.5em';
    if (el.tagName === 'H2') htmlEl.style.fontSize = '1.3em';
    if (el.tagName === 'H3') htmlEl.style.fontSize = '1.1em';
  });

  temp.querySelectorAll('strong, b').forEach(el => {
    (el as HTMLElement).style.fontWeight = 'bold';
  });

  temp.querySelectorAll('em, i').forEach(el => {
    (el as HTMLElement).style.fontStyle = 'italic';
  });

  temp.querySelectorAll('ul, ol').forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.marginLeft = '20px';
    htmlEl.style.paddingLeft = '10px';
  });

  temp.querySelectorAll('p').forEach(el => {
    (el as HTMLElement).style.marginBottom = '8px';
  });

  return temp.innerHTML;
}

/**
 * Copy HTML content to clipboard
 * @param html - HTML content to copy
 * @param plainText - Plain text fallback
 * @returns Success status
 */
export async function copyHTMLToClipboard(html: string, plainText?: string): Promise<boolean> {
  try {
    // Clean HTML for better compatibility
    const cleanedHTML = cleanHTMLForClipboard(html);

    // Modern Clipboard API with HTML support
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([cleanedHTML], { type: 'text/html' });
      const textBlob = new Blob([plainText || cleanedHTML], { type: 'text/plain' });

      const clipboardItem = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });

      await navigator.clipboard.write([clipboardItem]);
      return true;
    }

    // Fallback: copy plain text only
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(plainText || cleanedHTML);
      return true;
    }

    // Legacy fallback using execCommand
    return copyToClipboardLegacy(plainText || cleanedHTML);
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    // Try legacy method as last resort
    return copyToClipboardLegacy(plainText || html);
  }
}

/**
 * Legacy clipboard copy method using execCommand
 * @param text - Text to copy
 * @returns Success status
 */
function copyToClipboardLegacy(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    return success;
  } catch (error) {
    console.error('Legacy clipboard copy failed:', error);
    return false;
  }
}

/**
 * Copy plain text to clipboard
 * @param text - Text to copy
 * @returns Success status
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return copyToClipboardLegacy(text);
  } catch (error) {
    console.error('Text copy failed:', error);
    return copyToClipboardLegacy(text);
  }
}

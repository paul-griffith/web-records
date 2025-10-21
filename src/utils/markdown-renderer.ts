/**
 * Markdown to HTML renderer utility
 */

import { marked } from 'marked';

/**
 * Configure marked options for clean, safe HTML output
 */
marked.setOptions({
  breaks: true,
  gfm: true
});

/**
 * Convert Markdown to HTML
 * @param markdown - Markdown text
 * @returns HTML string
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  try {
    const html = marked.parse(markdown) as string;
    return html;
  } catch (error) {
    console.error('Markdown rendering error:', error);
    // Fallback: return as-is with line breaks converted
    return markdown.replace(/\n/g, '<br>');
  }
}

/**
 * Convert HTML back to plain text (for clipboard plain text fallback)
 * @param html - HTML string
 * @returns Plain text
 */
export function htmlToPlainText(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

/**
 * Sanitize HTML to prevent XSS (basic sanitization)
 * For production, consider using DOMPurify library
 * @param html - HTML string
 * @returns Sanitized HTML
 */
export function sanitizeHTML(html: string): string {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

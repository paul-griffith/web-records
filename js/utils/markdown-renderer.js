/**
 * Markdown to HTML renderer utility
 */

import { marked } from 'marked';

/**
 * Configure marked options for clean, safe HTML output
 */
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});

/**
 * Convert Markdown to HTML
 * @param {string} markdown - Markdown text
 * @returns {string} HTML string
 */
export function renderMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  try {
    const html = marked.parse(markdown);
    return html;
  } catch (error) {
    console.error('Markdown rendering error:', error);
    // Fallback: return as-is with line breaks converted
    return markdown.replace(/\n/g, '<br>');
  }
}

/**
 * Convert HTML back to plain text (for clipboard plain text fallback)
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function htmlToPlainText(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

/**
 * Sanitize HTML to prevent XSS (basic sanitization)
 * For production, consider using DOMPurify library
 * @param {string} html - HTML string
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

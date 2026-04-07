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
  if (!markdown) {
    return '';
  }

  try {
    return marked.parse(markdown) as string;
  } catch (error) {
    console.error('Markdown rendering error:', error);
    // Fallback: return as-is with line breaks converted
    return markdown.replace(/\n/g, '<br>');
  }
}

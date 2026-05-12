/**
 * Simple Markdown Parser for Chat Messages
 * Handles basic markdown syntax: **bold**, *italic*, `code`, line breaks
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function parseMarkdown(text: string): string {
  if (!text) return '';
  
  // Escape user/model content first, then add a tiny allow-list of markdown tags.
  let parsed = escapeHtml(text);
  
  // Convert **bold** to <strong>
  parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>
  parsed = parsed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Convert `code` to <code>
  parsed = parsed.replace(/`([^`]+)`/g, '<code style="background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>');
  
  // Convert line breaks to <br>
  parsed = parsed.replace(/\n/g, '<br>');
  
  return parsed;
}

/**
 * Parse markdown and return as React-compatible HTML
 */
export function parseMarkdownToHTML(text: string): { __html: string } {
  return { __html: parseMarkdown(text) };
}

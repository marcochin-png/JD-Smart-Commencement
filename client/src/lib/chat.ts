export type AttachmentMeta = { name: string; size: number; type?: string };

function isStandaloneDemoMode(): boolean {
  if (import.meta.env.VITE_STANDALONE_DEMO === 'true') {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.hostname.endsWith('github.io');
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }
}

function buildMockReply(message: string, lang: string, attachments: AttachmentMeta[] = []) {
  const normalized = message.trim().toLowerCase();
  const hasAttachment = attachments.length > 0;
  const isEnglish = lang.toLowerCase().startsWith('en');

  if (hasAttachment) {
    return isEnglish
      ? 'GitHub Pages demo mode is active. Your uploaded files are stored locally in the browser so the UI can be demonstrated without the Express backend.'
      : 'GitHub Pages 示範模式已啟用。你上傳的文件只會保留在瀏覽器本地，讓整個介面在沒有 Express 後端的情況下仍可示範。';
  }

  if (normalized.includes('case number') || normalized.includes('案件編號')) {
    return isEnglish
      ? 'This GitHub Pages build runs in standalone demo mode. Please continue with the mocked claimant or defendant flow on this page.'
      : '這個 GitHub Pages 版本正以獨立示範模式運行。請在本頁繼續使用模擬的申索人或被告人流程。';
  }

  if (normalized.includes('upload') || normalized.includes('上傳')) {
    return isEnglish
      ? 'Use the upload area as normal. The interface will continue with local mock responses only, without calling any backend service.'
      : '可照常使用上傳區。介面之後只會提供本地 mock 回應，不會呼叫任何後端服務。';
  }

  return isEnglish
    ? 'Standalone demo mode is enabled for GitHub Pages. Officer Portal mock cases, document counts, readiness checklist, and chat replies are all running entirely in the browser.'
    : '已為 GitHub Pages 啟用獨立示範模式。Officer Portal 的模擬案件、文件數量、readiness checklist 與聊天回覆，現在全部在瀏覽器中運行。';
}

async function streamMockChat(
  message: string,
  opts?: { onChunk?: (chunk: string) => void; attachments?: AttachmentMeta[]; signal?: AbortSignal; lang?: string; model?: string }
): Promise<string> {
  const output = buildMockReply(message, opts?.lang || 'zh', opts?.attachments || []);
  const chunks = output.match(/.{1,24}/g) ?? [output];
  let combined = '';

  for (const chunk of chunks) {
    throwIfAborted(opts?.signal);
    await delay(18);
    combined += chunk;
    opts?.onChunk?.(chunk);
  }

  return combined;
}

// Get or create persistent session ID
function getSessionId(): string {
  try {
    let sessionId = localStorage.getItem('sc_session_id');
    if (!sessionId) {
      sessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sc_session_id', sessionId);
    }
    return sessionId;
  } catch (e) {
    return `sess-${Date.now()}`;
  }
}

// Force regenerate session ID
export function regenerateSessionId(): string {
  try {
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sc_session_id', sessionId);
    return sessionId;
  } catch (e) {
    return `sess-${Date.now()}`;
  }
}

export async function streamChat(
  message: string,
  opts?: { onChunk?: (chunk: string) => void; attachments?: AttachmentMeta[]; signal?: AbortSignal; lang?: string; model?: string }
): Promise<string> {
  if (isStandaloneDemoMode()) {
    return streamMockChat(message, opts);
  }

  const onChunk = opts?.onChunk;
  const sessionId = getSessionId();
  try {
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message, attachments: opts?.attachments || [], lang: opts?.lang || 'zh', model: opts?.model }),
      signal: opts?.signal,
    });

    if (res.ok && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let out = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          out += chunk;
          onChunk && onChunk(chunk);
        }
      }

      return out;
    }

    const json = await res.json().catch(() => null);
    const errMsg = (json && json.error) ? json.error : `Upstream error: ${res.status}`;
    throw new Error(errMsg);
  } catch (err: any) {
    // propagate error to the caller so UI can show the real failure
    throw err;
  }
}

export async function sendAnalytics(event: unknown) {
  if (isStandaloneDemoMode()) {
    try {
      const existing = JSON.parse(localStorage.getItem('sc_demo_analytics') || '[]');
      existing.push(event);
      localStorage.setItem('sc_demo_analytics', JSON.stringify(existing.slice(-100)));
    } catch {
      // ignore demo analytics persistence failures
    }
    return;
  }

  try {
    await fetch('/__manus__/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionEvents: [event] }),
    });
  } catch {
    // ignore errors in analytics
  }
}

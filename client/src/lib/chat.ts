export type AttachmentMeta = { name: string; size: number; type?: string };

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

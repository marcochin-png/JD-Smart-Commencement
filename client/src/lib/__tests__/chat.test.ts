import { describe, it, expect, vi } from 'vitest';
import { streamChat } from '../chat';

describe('streamChat', () => {
  it('propagates network errors to caller', async () => {
    const orig = (global as any).fetch;
    (global as any).fetch = vi.fn(() => Promise.reject(new Error('network')));

    await expect(streamChat('hello world')).rejects.toThrow('network');

    (global as any).fetch = orig;
  });

  it('returns a standalone mock reply when VITE_STANDALONE_DEMO is enabled', async () => {
    vi.stubEnv('VITE_STANDALONE_DEMO', 'true');

    await expect(streamChat('hello world', { lang: 'en' })).resolves.toContain('Standalone demo mode is enabled for GitHub Pages');

    vi.unstubAllEnvs();
  });
});

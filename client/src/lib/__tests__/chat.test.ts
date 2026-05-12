import { describe, it, expect, vi } from 'vitest';
import { streamChat } from '../chat';

describe('streamChat', () => {
  it('propagates network errors to caller', async () => {
    const orig = (global as any).fetch;
    (global as any).fetch = vi.fn(() => Promise.reject(new Error('network')));

    await expect(streamChat('hello world')).rejects.toThrow('network');

    (global as any).fetch = orig;
  });
});

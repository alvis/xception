// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';

import {
  decodeBase64,
  fetchWebContent,
  readLocalContent,
} from '#content.browser';

describe('fn:decodeBase64', () => {
  it('should decode a base64-encoded string in a browser environment', () => {
    const encoded = 'SGVsbG8sIHdvcmxkIQ==';
    const expected = 'Hello, world!';

    const decoded = decodeBase64(encoded);

    expect(decoded).toEqual(expected);
  });

  it('should handle an empty string', () => {
    const encoded = '';
    const expected = '';

    const result = decodeBase64(encoded);

    expect(result).toEqual(expected);
  });
});

describe('fn:fetchWebContent', () => {
  it('should retrieve content from a URL returning 200', async () => {
    const expected = 'web content';

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve({
          ok: true,
          text: async () => Promise.resolve(expected),
        }),
      ),
    );

    const result = await fetchWebContent('http://example.com');

    expect(result).toEqual(expected);
  });

  it('should return null for a URL returning non-200 status', async () => {
    const expected = null;

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve({
          ok: false,
        }),
      ),
    );

    const result = await fetchWebContent('http://example.com');

    expect(result).toEqual(expected);
  });
});

describe('fn:readLocalContent', () => {
  it('should return null for any local file path in a browser environment', async () => {
    const expected = null;

    const result = await readLocalContent('file:///file.ts');

    expect(result).toEqual(expected);
  });
});

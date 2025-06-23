// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';

import { decodeBase64, fetchWebContent, readLocalContent } from '#content.node';

import { DUMMY_SOURCE_WITH_SOURCEMAP_AND_ORIGINAL_SOURCE } from './fixture';

vi.mock('node:fs', () => ({
  existsSync: vi.fn((path) => path === '/file.ts'),
  readFileSync: vi.fn((path) => {
    switch (path) {
      case '/file.ts':
        return DUMMY_SOURCE_WITH_SOURCEMAP_AND_ORIGINAL_SOURCE;
      default:
        throw new Error(`missing readFileSync mock at path: ${path}`);
    }
  }),
}));

describe('fn:decodeBase64', () => {
  it('should decode a base64-encoded string in a Node.js environment', () => {
    const encoded = 'SGVsbG8sIHdvcmxkIQ==';
    const expected = 'Hello, world!';

    const result = decodeBase64(encoded);

    expect(result).toEqual(expected);
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
  it('should retrieve content from a valid local file', async () => {
    const expected = DUMMY_SOURCE_WITH_SOURCEMAP_AND_ORIGINAL_SOURCE;

    const result = await readLocalContent('file:///file.ts');

    expect(result).toEqual(expected);
  });

  it('should return null for an invalid local file', async () => {
    const expected = null;

    const result = await readLocalContent('file:///invalid/path');

    expect(result).toEqual(expected);
  });
});

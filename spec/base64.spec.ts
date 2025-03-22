import { describe, expect, it, vi } from 'vitest';

import { base64Decode } from '#base64';

describe('base64Decode', () => {
  it('should decode a base64-encoded string in a browser environment', () => {
    vi.stubGlobal(
      'atob',
      vi.fn((input) => Buffer.from(input, 'base64').toString('utf-8')),
    );

    const encoded = 'SGVsbG8sIHdvcmxkIQ=='; // "Hello, world!"
    const decoded = base64Decode(encoded);

    expect(decoded).toEqual('Hello, world!');
    expect(atob).toHaveBeenCalledWith(encoded);
  });

  it('should decode a base64-encoded string in a Node.js environment', () => {
    vi.stubGlobal('atob', undefined);

    const encoded = 'SGVsbG8sIHdvcmxkIQ=='; // "Hello, world!"
    const decoded = base64Decode(encoded);

    expect(decoded).toEqual('Hello, world!');
  });

  it('should handle an empty string', () => {
    const encoded = '';
    const decoded = base64Decode(encoded);

    expect(decoded).toEqual('');
  });

  it('should throw an error for invalid base64 strings', () => {
    const invalidBase64 = 'invalid base64';

    expect(() => base64Decode(invalidBase64)).toThrowError();
  });
});

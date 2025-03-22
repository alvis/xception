/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on source loading
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { describe, expect, it, vi } from 'vitest';

import {
  createSourceResolver,
  createSourceResolverWithSource,
  fetchWebContent,
  readLocalFile,
} from '#source';

const DUMMY_SOURCE_WITHOUT_SOURCEMAP = `console.log('Hello, world!');`;

const DUMMY_SOURCE_WITH_SOURCEMAP_AND_ORIGINAL_SOURCE = `console.log('Hello, world!');\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJmaWxlLmpzIiwKICAic291cmNlcyI6IFsiZmlsZS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc29sZS5sb2coJ0hlbGxvLCB3b3JsZCEnKTsiXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDIgp9`;

const DUMMY_SOURCE_WITH_SOURCEMAP_BUT_NO_ORIGINAL_SOURCE = `console.log('Hello, world!');\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJmaWxlLmpzIiwKICAic291cmNlcyI6IFsiZmlsZS50cyJdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMiCn0=`;

vi.mock('fs', () => ({
  existsSync: vi.fn((path) => path === '/file.ts'),
  readFileSync: vi.fn((path) =>
    path === '/file.ts' ? DUMMY_SOURCE_WITH_SOURCEMAP_AND_ORIGINAL_SOURCE : '',
  ),
}));

describe('fn:createSourceResolver', () => {
  it('should create a resolver for mapping a source from a web URL', async () => {
    global.fetch = vi.fn(async () =>
      Promise.resolve({
        ok: true,
        text: async () => Promise.resolve('source content'),
      }),
    ) as any;

    const resolve = await createSourceResolver('http://example.com');
    const result = resolve({ line: 1, column: 0 });

    const expected = {
      identifier: 'http://example.com',
      source: 'source content',
      line: 1,
      column: 0,
    };

    expect(result).toEqual(expected);
  });

  it('should create a resolver for mapping a source from a local file', async () => {
    const resolve = await createSourceResolver('file:///file.ts');
    const result = resolve({ line: 1, column: 0 });

    const expected = {
      identifier: 'file.ts',
      source: `console.log('Hello, world!');`,
      line: 1,
      column: 0,
    };

    expect(result).toEqual(expected);
  });

  it('should return original source details if the source cannot be resolved', async () => {
    const resolve = await createSourceResolver('file:///invalid/path');
    const result = resolve({ line: 1, column: 0 });

    const expected = {
      identifier: 'file:///invalid/path',
      line: 1,
      column: 0,
    };

    expect(result).toEqual(expected);
  });
});

describe('fn:readLocalFile', () => {
  it('should retrieve content from a valid local file', async () => {
    const result = await readLocalFile('file:///file.ts');

    expect(result).toEqual(DUMMY_SOURCE_WITH_SOURCEMAP_AND_ORIGINAL_SOURCE);
  });

  it('should return null for an invalid local file', async () => {
    const result = await readLocalFile('file:///invalid/path');

    expect(result).toEqual(null);
  });

  it('should not retrieve local file content under a browser environment', async () => {
    vi.stubGlobal('process', { versions: {} });

    const result = await readLocalFile('file:///file.ts');

    expect(result).toEqual(null);
  });
});

describe('fn:fetchWebContent', () => {
  it('should retrieve content from a valid URL', async () => {
    global.fetch = vi.fn(async () =>
      Promise.resolve({
        ok: true,
        text: async () => Promise.resolve('web content'),
      }),
    ) as any;

    const result = await fetchWebContent('http://example.com');

    expect(result).toEqual('web content');
  });

  it('should return null for an invalid URL', async () => {
    global.fetch = vi.fn(async () => Promise.resolve({ ok: false })) as any;

    const result = await fetchWebContent('http://example.com');

    expect(result).toEqual(null);
  });
});

describe('fn:createSourceResolverWithSource', () => {
  it('should parse and map an inline source map', async () => {
    const source = DUMMY_SOURCE_WITH_SOURCEMAP_AND_ORIGINAL_SOURCE;

    const resolve = createSourceResolverWithSource('file.js', source);
    const result = resolve({ line: 1, column: 0 });

    const expected = {
      identifier: 'file.ts',
      source: "console.log('Hello, world!');",
      line: 1,
      column: 0,
    };

    expect(result).toEqual(expected);
  });

  it('should return compiled source details if no inline source map is found', async () => {
    const source = DUMMY_SOURCE_WITHOUT_SOURCEMAP;

    const resolve = createSourceResolverWithSource('file.js', source);
    const result = resolve({ line: 1, column: 0 });

    const expected = { identifier: 'file.js', source, line: 1, column: 0 };

    expect(result).toEqual(expected);
  });

  it('should return compiled source details if the inline source map does not contain the original source', async () => {
    const source = DUMMY_SOURCE_WITH_SOURCEMAP_BUT_NO_ORIGINAL_SOURCE;

    const resolve = createSourceResolverWithSource('file.js', source);
    const result = resolve({ line: 1, column: 0 });

    const expected = { identifier: 'file.js', source, line: 1, column: 0 };

    expect(result).toEqual(expected);
  });
});

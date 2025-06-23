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

import { createSourceResolver, createSourceResolverWithSource } from '#source';

import {
  DUMMY_SOURCE_WITH_SOURCEMAP_AND_ORIGINAL_SOURCE,
  DUMMY_SOURCE_WITH_SOURCEMAP_BUT_NO_ORIGINAL_SOURCE,
  DUMMY_SOURCE_WITHOUT_SOURCEMAP,
} from './fixture';

vi.mock(
  '#content',
  async (importActual) =>
    ({
      ...(await importActual<typeof import('#content')>()),
      fetchWebContent: vi.fn(async (url) => {
        switch (url) {
          case 'http://example.com':
            return 'source content';
          default:
            return null;
        }
      }),
      readLocalContent: vi.fn(async (path) => {
        switch (path) {
          case 'file:///file.ts':
            return DUMMY_SOURCE_WITH_SOURCEMAP_AND_ORIGINAL_SOURCE;
          case 'file:///invalid/path':
            return null;
          default:
            return null;
        }
      }),
    }) satisfies typeof import('#content'),
);

describe('fn:createSourceResolver', () => {
  it('should create a resolver for mapping a source from a web URL', async () => {
    const expected = {
      identifier: 'http://example.com',
      source: 'source content',
      line: 1,
      column: 0,
    };

    const resolve = await createSourceResolver('http://example.com');
    const result = resolve({ line: 1, column: 0 });

    expect(result).toEqual(expected);
  });

  it('should create a resolver for mapping a source from a local file', async () => {
    const expected = {
      identifier: 'file.ts',
      source: `console.log('Hello, world!');`,
      line: 1,
      column: 0,
    };

    const resolve = await createSourceResolver('file:///file.ts');
    const result = resolve({ line: 1, column: 0 });

    expect(result).toEqual(expected);
  });

  it('should return original source details if the source cannot be resolved', async () => {
    const expected = {
      identifier: 'file:///invalid/path',
      line: 1,
      column: 0,
    };

    const resolve = await createSourceResolver('file:///invalid/path');
    const result = resolve({ line: 1, column: 0 });

    expect(result).toEqual(expected);
  });
});

describe('fn:createSourceResolverWithSource', () => {
  it('should parse and map an inline source map', async () => {
    const source = DUMMY_SOURCE_WITH_SOURCEMAP_AND_ORIGINAL_SOURCE;

    const expected = {
      identifier: 'file.ts',
      source: "console.log('Hello, world!');",
      line: 1,
      column: 0,
    };

    const resolve = createSourceResolverWithSource('file.js', source);
    const result = resolve({ line: 1, column: 0 });

    expect(result).toEqual(expected);
  });

  it('should return compiled source details if no inline source map is found', async () => {
    const source = DUMMY_SOURCE_WITHOUT_SOURCEMAP;

    const expected = { identifier: 'file.js', source, line: 1, column: 0 };

    const resolve = createSourceResolverWithSource('file.js', source);
    const result = resolve({ line: 1, column: 0 });

    expect(result).toEqual(expected);
  });

  it('should return compiled source details if the inline source map does not contain the original source', async () => {
    const source = DUMMY_SOURCE_WITH_SOURCEMAP_BUT_NO_ORIGINAL_SOURCE;

    const expected = { identifier: 'file.js', source, line: 1, column: 0 };

    const resolve = createSourceResolverWithSource('file.js', source);
    const result = resolve({ line: 1, column: 0 });

    expect(result).toEqual(expected);
  });
});

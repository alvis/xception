/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on error rendering
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { describe, expect, it, vi } from 'vitest';

import { Xception } from '#base';
import { renderError } from '#render';

import { ansi } from './ansi';

vi.mock('node:fs', () => ({
  existsSync(path: string) {
    switch (path) {
      case 'src1':
      case 'src2':
        return true;
      default:
        return false;
    }
  },
  readFileSync(path: string) {
    switch (path) {
      case 'src1':
      case 'src2':
        return new Array(20)
          .fill(undefined)
          .map((_, index) => `line ${index + 1}`)
          .join('\n');
      default:
        throw new Error(`unrecognized path: ${path}`);
    }
  },
}));

class MockedError extends Error {
  constructor(stack: string) {
    super();

    this.name = stack.split('\n')[0].split(':')[0];
    this.message = stack.split('\n')[0].split(':')[1].trim();
    this.stack = stack;
  }
}

describe('fn:renderError', () => {
  it('should render an error stack with its own format', async () => {
    const rendered = (
      await renderError(
        new MockedError(
          'Error1: message1\n' +
            '    at entry1 (src1:1:0)\n' +
            '    at entry2 (src2:2:0)',
        ),
      )
    ).replace(ansi, '');

    expect(rendered).toEqual(
      '[Error1] message1\n' +
        '    at entry1 (src1:1:0)\n' +
        '    at entry2 (src2:2:0)',
    );
  });

  it('should skip the stack if instructed', async () => {
    const rendered = (
      await renderError(
        new MockedError(
          'Error1: message1\n' +
            '    at entry1 (src1:1:0)\n' +
            '    at entry2 (src2:2:0)',
        ),
        { showStack: false },
      )
    ).replace(ansi, '');

    expect(rendered).toEqual('[Error1] message1');
  });

  it('should render an error stack without node:internal & node_modules by default', async () => {
    const rendered = (
      await renderError(
        new MockedError(
          'Error1: message1\n' +
            '    at entry1 (src1:1:0)\n' +
            '    at third_party (./node_modules/third_party/src:1:0)\n' +
            '    at internal (node:internal/modules/cjs/helper:1:0)\n' +
            '    at entry2 (src2:2:0)',
        ),
      )
    ).replace(ansi, '');

    expect(rendered).toEqual(
      '[Error1] message1\n' +
        '    at entry1 (src1:1:0)\n' +
        '    at entry2 (src2:2:0)',
    );
  });

  it('should render an error stack according to the supplied filter', async () => {
    const rendered = (
      await renderError(
        new MockedError(
          'Error1: message1\n' +
            '    at entry1 (src1:1:0)\n' +
            '    at third_party (./node_modules/third_party/src:1:0)\n' +
            '    at internal (node:internal/modules/cjs/helper:1:0)\n' +
            '    at entry2 (src2:2:0)',
        ),
        { filter: (path: string) => !path.includes('node_modules') },
      )
    ).replace(ansi, '');

    expect(rendered).toEqual(
      '[Error1] message1\n' +
        '    at entry1 (src1:1:0)\n' +
        '    at internal (node:internal/modules/cjs/helper:1:0)\n' +
        '    at entry2 (src2:2:0)',
    );
  });

  it('should render an error stack with the source in a node js environment', async () => {
    const rendered = (
      await renderError(
        new MockedError(
          'Error1: message1\n' +
            '    at entry1 (src1:1:0)\n' +
            '    at entry2 (src2:9:0)',
        ),
        { showSource: true },
      )
    ).replace(ansi, '');

    expect(rendered).toEqual(
      '[Error1] message1\n' +
        '    at entry1 (src1:1:0)\n' +
        '\n' +
        ' > 1 | line 1\n' +
        '   2 | line 2\n' +
        '   3 | line 3\n' +
        '   4 | line 4\n' +
        '   5 | line 5\n' +
        '\n' +
        '    at entry2 (src2:9:0)',
    );
  });

  it('should render an error stack with the source absent', async () => {
    const rendered = (
      await renderError(
        new MockedError(
          'Error1: message1\n' +
            '    at entry1 (absent:1:0)\n' +
            '    at entry2 (absent:2:0)',
        ),
        { showSource: true },
      )
    ).replace(ansi, '');

    expect(rendered).toEqual(
      '[Error1] message1\n' +
        '    at entry1 (absent:1:0)\n' +
        '    at entry2 (absent:2:0)',
    );
  });

  it('should render metadata', async () => {
    const rendered = (
      await renderError(
        new Xception('message1', {
          meta: { name: 'xception' },
        }),
      )
    ).replace(ansi, '');

    expect(rendered).toContain(
      '[Xception] message1\n' +
        '\n' +
        '    METADATA\n' +
        '    name: xception\n' +
        '\n' +
        '    at',
    );
  });

  it('should render associations', async () => {
    const rendered = (
      await renderError(
        new Xception('message', {
          namespace: 'xception',
          tags: ['tag1', 'tag2'],
          meta: { name: 'xception', source: 'test' },
        }),
      )
    ).replace(ansi, '');

    expect(rendered).toContain(
      '[Xception] message\n' +
        '\n' +
        '    xception tag1 tag2\n' +
        '\n' +
        '    METADATA\n' +
        '    name: xception\n' +
        '    source: test\n' +
        '\n' +
        '    at',
    );
  });

  it('should render a nested error', async () => {
    const rendered = (
      await renderError(
        new Xception('message1', {
          cause: new Xception('message2'),
        }),
      )
    ).replace(ansi, '');

    expect(rendered).toContain('[Xception] message1\n' + '    at');
    expect(rendered).toContain('[Xception] message2\n' + '      at');
  });

  it('should render a non-error cause', async () => {
    const rendered = (
      await renderError(
        new Xception('message', {
          cause: 'something went wrong',
        }),
      )
    ).replace(ansi, '');

    expect(rendered).toContain('[Xception] message\n');
    expect(rendered).toContain('CAUSE\n' + '    something went wrong');
  });
});

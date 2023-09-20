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

import { jest } from '@jest/globals';

import { Xception } from '#prototype';

jest.unstable_mockModule('node:fs', () => ({
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
        throw new Error(`unrecognised path: ${path}`);
    }
  },
}));

const ansiPattern = [
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
].join('|');
const ansiExpression = new RegExp(ansiPattern, 'g');

class MockedError extends Error {
  constructor(stack: string) {
    super();

    this.stack = stack;
  }
}

const { renderStack } = await import('#render');
describe('fn:renderStack', () => {
  it('should render an error stack with its own format', () => {
    const rendered = renderStack(
      new MockedError(
        'Error1: message1\n' +
          '    at entry1 (src1:1:0)\n' +
          'Error2: message2\n' +
          '    at entry2 (src2:2:0)',
      ),
    );

    const plain = rendered.replace(ansiExpression, '');

    expect(plain).toEqual(
      '[Error1] message1\n' +
        '    at entry1 (src1:1:0)\n' +
        '[Error2] message2\n' +
        '    at entry2 (src2:2:0)',
    );
  });

  it('should render an error stack without node:internal by default', () => {
    const rendered = renderStack(
      new MockedError(
        'Error1: message1\n' +
          '    at entry1 (src1:1:0)\n' +
          '    at third_party (./node_modules/third_party/src:1:0)\n' +
          '    at internal (node:internal/modules/cjs/helper:1:0)\n' +
          'Error2: message2\n' +
          '    at entry2 (src2:2:0)',
      ),
    );

    const plain = rendered.replace(ansiExpression, '');

    expect(plain).toEqual(
      '[Error1] message1\n' +
        '    at entry1 (src1:1:0)\n' +
        '    at third_party (./node_modules/third_party/src:1:0)\n' +
        '[Error2] message2\n' +
        '    at entry2 (src2:2:0)',
    );
  });

  it('should render an error stack according to the supplued filter', () => {
    const rendered = renderStack(
      new MockedError(
        'Error1: message1\n' +
          '    at entry1 (src1:1:0)\n' +
          '    at third_party (./node_modules/third_party/src:1:0)\n' +
          '    at internal (node:internal/modules/cjs/helper:1:0)\n' +
          'Error2: message2\n' +
          '    at entry2 (src2:2:0)',
      ),
      { filter: (path: string) => !path.includes('node_modules') },
    );

    const plain = rendered.replace(ansiExpression, '');

    expect(plain).toEqual(
      '[Error1] message1\n' +
        '    at entry1 (src1:1:0)\n' +
        '    at internal (node:internal/modules/cjs/helper:1:0)\n' +
        '[Error2] message2\n' +
        '    at entry2 (src2:2:0)',
    );
  });

  it('should render an error stack with the source', () => {
    const rendered = renderStack(
      new MockedError(
        'Error1: message1\n' +
          '    at entry1 (src1:1:0)\n' +
          'Error2: message2\n' +
          '    at entry2 (src2:9:0)',
      ),
      { showSource: true },
    );

    const plain = rendered.replace(ansiExpression, '');

    expect(plain).toEqual(
      '[Error1] message1\n' +
        '    at entry1 (src1:1:0)\n' +
        '\n' +
        ' > 1 | line 1\n' +
        '   2 | line 2\n' +
        '   3 | line 3\n' +
        '   4 | line 4\n' +
        '   5 | line 5\n' +
        '\n' +
        '[Error2] message2\n' +
        '    at entry2 (src2:9:0)\n' +
        '\n' +
        '    5 | line 5\n' +
        '    6 | line 6\n' +
        '    7 | line 7\n' +
        '    8 | line 8\n' +
        ' >  9 | line 9\n' +
        '   10 | line 10\n' +
        '   11 | line 11\n' +
        '   12 | line 12\n' +
        '   13 | line 13\n',
    );
  });

  it('should render an error stack with the source absent', () => {
    const rendered = renderStack(
      new MockedError(
        'Error1: message1\n' +
          '    at entry1 (absent:1:0)\n' +
          'Error2: message2\n' +
          '    at entry2 (absent:2:0)',
      ),
      { showSource: true },
    );

    const plain = rendered.replace(ansiExpression, '');

    expect(plain).toEqual(
      '[Error1] message1\n' +
        '    at entry1 (absent:1:0)\n' +
        '[Error2] message2\n' +
        '    at entry2 (absent:2:0)',
    );
  });

  it('should render metadata', () => {
    const rendered = renderStack(
      new Xception('message', {
        cause: new Xception('message', {
          meta: { name: 'xception' },
        }),
      }),
    );

    const plain = rendered.replace(ansiExpression, '');

    expect(plain).toContain('[Xception] message\n' + '    at');
    expect(plain).toContain(
      '[Xception] message\n' + '\n' + '    name: xception\n' + '\n' + '    at',
    );
  });

  it('should render associations', () => {
    const rendered = renderStack(
      new Xception('message', {
        namespace: 'xception',
        tags: ['tag1', 'tag2'],
        meta: { name: 'xception' },
      }),
    );

    const plain = rendered.replace(ansiExpression, '');

    expect(plain).toContain(
      '[Xception] message\n' +
        '\n' +
        '    xception tag1 tag2\n' +
        '\n' +
        '    name: xception\n' +
        '\n' +
        '    at',
    );
  });
});

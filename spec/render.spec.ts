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

import { renderStack } from '#render';

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

describe('fn:renderStack', () => {
  it('renders an error stack with its own format', () => {
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
});

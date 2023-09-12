/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on xceptionalize
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2023 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { Xception } from '#prototype';

import { xceptionalize } from '#xceptionalize';

describe('fn:xceptionalize', () => {
  it('wraps an error as an Xception', () => {
    try {
      throw new Error('test');
    } catch (error) {
      const xceptionalizedError = xceptionalize(error);
      expect(xceptionalizedError).toBeInstanceOf(Xception);
      expect(xceptionalizedError.name).toEqual('Error');
      expect(xceptionalizedError.message).toEqual('test');
      expect(xceptionalizedError.meta).toEqual({});
      expect(xceptionalizedError.stack).toEqual(error.stack);
    }
  });

  it('ignores any xception instance', () => {
    const xception = new Xception('test');
    const xceptionalizedError = xceptionalize(xception);

    expect(xceptionalizedError).toEqual(xception);
  });
});

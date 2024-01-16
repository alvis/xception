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

import { $meta } from '#symbols';
import xception from '#xception';

describe('fn:xceptionalize', () => {
  it('should wrap a string as an Xception', () => {
    const xceptionalizedError = xception('test');
    expect(xceptionalizedError).toBeInstanceOf(Xception);
    expect(xceptionalizedError.name).toEqual('Xception');
    expect(xceptionalizedError.message).toEqual('non-error: test');
    expect(xceptionalizedError.stack).toBeDefined();
    expect(xceptionalizedError[$meta]).toEqual({});
  });

  it('should wrap an error as an Xception', () => {
    try {
      throw new Error('test');
    } catch (error) {
      const xceptionalizedError = xception(error);
      expect(xceptionalizedError).toBeInstanceOf(Xception);
      expect(xceptionalizedError.name).toEqual('Error');
      expect(xceptionalizedError.message).toEqual('test');
      expect(xceptionalizedError.stack).toEqual(error.stack);
      expect(xceptionalizedError[$meta]).toEqual({});
    }
  });

  it('should wrap an error-like object as an Xception', () => {
    const xceptionalizedError = xception({ message: 'test' });
    expect(xceptionalizedError).toBeInstanceOf(Xception);
    expect(xceptionalizedError.name).toEqual('Xception');
    expect(xceptionalizedError.message).toEqual('test');
    expect(xceptionalizedError[$meta]).toEqual({});
  });

  it('should ignore any xception instance', () => {
    const xceptionError = new Xception('test');
    const xceptionalizedError = xception(xceptionError);

    expect(xceptionalizedError).toEqual(xceptionError);
  });

  it('should throw an exception if the input is not a string, an error or an Xception', () => {
    const xceptionalizedError = xception(1);

    expect(xceptionalizedError.message).toEqual(`non-error: 1`);
    expect(xceptionalizedError.cause).toEqual(1);
  });
});

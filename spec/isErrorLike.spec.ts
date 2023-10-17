/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on error-like object detection
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2023 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { isErrorLike } from '#isErrorLike';

describe('fn:isErrorLike', () => {
  it('should return true for an object with message, name, and stack properties', () => {
    const errorLike = {
      message: 'test message',
      name: 'TestError',
      stack:
        'TestError: test message\n    at testFunction (/path/to/file.js:1:1)',
    };

    expect(isErrorLike(errorLike)).toBe(true);
  });

  it('should return true for an object with without name', () => {
    const errorLike = {
      message: 'test message',
      stack:
        'TestError: test message\n    at testFunction (/path/to/file.js:1:1)',
    };

    expect(isErrorLike(errorLike)).toBe(true);
  });

  it('should return true for an object as long as it has message', () => {
    const errorLike = {
      message: 'test message',
    };

    expect(isErrorLike(errorLike)).toBe(true);
  });

  it('should return false for an object without message property', () => {
    const errorLike = {
      name: 'TestError',
      stack:
        'TestError: test message\n    at testFunction (/path/to/file.js:1:1)',
    };

    expect(isErrorLike(errorLike)).toBe(false);
  });

  it('should return false for a non-object value', () => {
    expect(isErrorLike('test')).toBe(false);
    expect(isErrorLike(123)).toBe(false);
    expect(isErrorLike(null)).toBe(false);
    expect(isErrorLike(undefined)).toBe(false);
  });
});

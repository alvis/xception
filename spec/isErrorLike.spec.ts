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

import { describe, expect, it } from 'vitest';

import { isErrorLike } from '#isErrorLike';

describe('fn:isErrorLike', () => {
  it('should return true for an object with message, name, and stack properties', () => {
    const errorLike = {
      message: 'test message',
      name: 'TestError',
      stack:
        'TestError: test message\n    at testFunction (/path/to/file.js:1:1)',
    };
    const expected = true;

    const result = isErrorLike(errorLike);

    expect(result).toBe(expected);
  });

  it('should return true for an object without name', () => {
    const errorLike = {
      message: 'test message',
      stack:
        'TestError: test message\n    at testFunction (/path/to/file.js:1:1)',
    };
    const expected = true;

    const result = isErrorLike(errorLike);

    expect(result).toBe(expected);
  });

  it('should return true for an object that has only a message property', () => {
    const errorLike = {
      message: 'test message',
    };
    const expected = true;

    const result = isErrorLike(errorLike);

    expect(result).toBe(expected);
  });

  it('should return false for an object without message property', () => {
    const errorLike = {
      name: 'TestError',
      stack:
        'TestError: test message\n    at testFunction (/path/to/file.js:1:1)',
    };
    const expected = false;

    const result = isErrorLike(errorLike);

    expect(result).toBe(expected);
  });

  it('should return false for a non-object value', () => {
    const expected = false;

    expect(isErrorLike('test')).toBe(expected);
    expect(isErrorLike(123)).toBe(expected);
    expect(isErrorLike(null)).toBe(expected);
    expect(isErrorLike(undefined)).toBe(expected);
  });
});

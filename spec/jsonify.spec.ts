/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on jsonify
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2023 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { describe, expect, it } from 'vitest';

import { jsonify } from '#jsonify';

describe('fn:jsonify', () => {
  it('should pass a simple JSON value', () => {
    const value = {
      foo: 'bar',
      baz: [1, 2, 3],
      qux: { a: true, b: false },
      null: null,
    };
    const expected = value;

    const result = jsonify(value);

    expect(result).toEqual(expected);
  });

  it('should return the type of a non-jsonifiable value', () => {
    const value = Symbol('foo');
    const expected = '[typeof symbol]';

    const result = jsonify(value);

    expect(result).toEqual(expected);
  });

  it('should ignore any non-jsonifiable property', () => {
    const value = {
      foo: 'bar',
      function: () => 'baz',
      symbol: Symbol('foo'),
    };
    const expected = {
      foo: 'bar',
    };

    const result = jsonify(value);

    expect(result).toEqual(expected);
  });

  it('should jsonify an error', () => {
    const value = new Error('message');
    const expected = {
      name: 'Error',
      message: 'message',
      stack: expect.any(String),
    };

    const result = jsonify(value);

    expect(result).toEqual(expected);
  });

  it('should jsonify an object with a toJSON method', () => {
    const value = {
      foo: 'bar',
      toJSON: () => 'baz',
    };
    const expected = 'baz';

    const result = jsonify(value);

    expect(result).toEqual(expected);
  });

  it('should jsonify a nested object with a toJSON method', () => {
    const value = {
      foo: 'bar',
      baz: {
        qux: 'quux',
        toJSON: () => 'qux',
      },
    };
    const expected = {
      foo: 'bar',
      baz: 'qux',
    };

    const result = jsonify(value);

    expect(result).toEqual(expected);
  });

  it('should handle a simple circular reference in an object', () => {
    const value = { foo: 'bar' };
    (value as Record<string, unknown>).self = value;
    const expected = {
      foo: 'bar',
      self: '[circular reference as .]',
    };

    const result = jsonify(value);

    expect(result).toEqual(expected);
  });

  it('should handle a simple circular reference in an array', () => {
    const value: any[] = [1, 2, 3];
    value.push(value);
    const expected = [1, 2, 3, '[circular reference as .]'];

    const result = jsonify(value);

    expect(result).toEqual(expected);
  });

  it('should ignore identical but non-circular reference', () => {
    const ref = { foo: 'bar' };
    const value = {
      a: ref,
      b: [1, 2, ref],
    };
    const expected = {
      a: { foo: 'bar' },
      b: [1, 2, { foo: 'bar' }],
    };

    const result = jsonify(value);

    expect(result).toEqual(expected);
  });
});

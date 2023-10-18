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

import { jsonify } from '#jsonify';

describe('fn:jsonify', () => {
  it('should pass a simple JSON value', () => {
    const value = {
      foo: 'bar',
      baz: [1, 2, 3],
      qux: { a: true, b: false },
      null: null,
    };

    expect(jsonify(value)).toEqual(value);
  });

  it('should return the type of a non-jsonifiable value', () => {
    const value = Symbol('foo');

    expect(jsonify(value)).toEqual('[typeof symbol]');
  });

  it('should ignore any non-jsonifiable property', () => {
    const value = {
      foo: 'bar',
      function: () => 'baz',
      symbol: Symbol('foo'),
    };

    expect(jsonify(value)).toEqual({
      foo: 'bar',
    });
  });

  it('should jsonify an error', () => {
    const value = new Error('message');

    expect(jsonify(value)).toEqual({
      name: 'Error',
      message: 'message',
      stack: expect.any(String),
    });
  });

  it('should jsonify an object with a toJSON method', () => {
    const value = {
      foo: 'bar',
      toJSON: () => 'baz',
    };

    expect(jsonify(value)).toEqual('baz');
  });

  it('should jsonify a nested object with a toJSON method ', () => {
    const value = {
      foo: 'bar',
      baz: {
        qux: 'quux',
        toJSON: () => 'qux',
      },
    };

    expect(jsonify(value)).toEqual({
      foo: 'bar',
      baz: 'qux',
    });
  });

  it('should take care of a simple circular reference in an object', () => {
    const value = { foo: 'bar' };
    value['self'] = value;

    expect(jsonify(value)).toEqual({
      foo: 'bar',
      self: '[circular reference as .]',
    });
  });

  it('should take care of a simple circular reference in an array', () => {
    const value: any[] = [1, 2, 3];
    value.push(value);

    expect(jsonify(value)).toEqual([1, 2, 3, '[circular reference as .]']);
  });

  it('should ignore identical but non-circular reference', () => {
    const ref = { foo: 'bar' };
    const value = {
      a: ref,
      b: [1, 2, ref],
    };

    expect(jsonify(value)).toEqual({
      a: { foo: 'bar' },
      b: [1, 2, { foo: 'bar' }],
    });
  });
});

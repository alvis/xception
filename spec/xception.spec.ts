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

import { describe, expect, it } from 'vitest';

import { Xception } from '#base';

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
      expect(xceptionalizedError.cause).toEqual(error);
    }
  });

  it('should wrap an error-like object as an Xception', () => {
    const xceptionalizedError = xception({ message: 'test' });
    expect(xceptionalizedError).toBeInstanceOf(Xception);
    expect(xceptionalizedError.name).toEqual('Xception');
    expect(xceptionalizedError.message).toEqual('test');
    expect(xceptionalizedError[$meta]).toEqual({});
    expect(xceptionalizedError.cause).toEqual({ message: 'test' });
  });

  it('should ignore any xception instance', () => {
    const cause = new Error('test');
    const xceptionError = new Xception('test', { cause });
    const xceptionalizedError = xception(xceptionError);

    expect(xceptionalizedError).toEqual(xceptionError);
    expect(xceptionalizedError.cause).toEqual(cause);
  });

  it('should throw an exception if the input is not a string, an error or an Xception', () => {
    const xceptionalizedError = xception(1);

    expect(xceptionalizedError.message).toEqual(`non-error: 1`);
    expect(xceptionalizedError.cause).toEqual(1);
  });

  it('should change the namespace of an Xception', () => {
    const original = new Xception('message', { namespace: 'original' });
    const xceptionalizedError = xception(original, { namespace: 'new' });

    expect(xceptionalizedError.namespace).toEqual('new');
  });

  it('should merge metadata of an Xception', () => {
    const original = new Xception('message', {
      meta: { bar: 'bar', foo: 'foo' },
    });
    const xceptionalizedError = xception(original, {
      meta: { bar: 'new', new: 'new' },
    });

    expect(xceptionalizedError.meta).toEqual({
      bar: 'new',
      foo: 'foo',
      new: 'new',
    });
  });

  it('should merge tags of an Xception', () => {
    const original = new Xception('message', { tags: ['foo', 'bar'] });
    const xceptionalizedError = xception(original, { tags: ['new', 'bar'] });

    expect(xceptionalizedError.tags).toEqual(['foo', 'bar', 'new']);
  });
});

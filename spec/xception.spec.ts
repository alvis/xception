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
    const input = 'test';
    const expectedName = 'Xception';
    const expectedMessage = 'non-error: test';
    const expectedMeta = {};

    const result = xception(input);

    expect(result).toBeInstanceOf(Xception);
    expect(result.name).toEqual(expectedName);
    expect(result.message).toEqual(expectedMessage);
    expect(result.stack).toBeDefined();
    expect(result[$meta]).toEqual(expectedMeta);
  });

  it('should wrap an error as an Xception', () => {
    const expectedName = 'Error';
    const expectedMessage = 'test';
    const expectedMeta = {};

    try {
      throw new Error(expectedMessage);
    } catch (error) {
      const result = xception(error);

      expect(result).toBeInstanceOf(Xception);
      expect(result.name).toEqual(expectedName);
      expect(result.message).toEqual(expectedMessage);
      expect(result.stack).toEqual(error.stack);
      expect(result[$meta]).toEqual(expectedMeta);
      expect(result.cause).toEqual(error);
    }
  });

  it('should wrap an error-like object as an Xception', () => {
    const input = { message: 'test' };
    const expectedName = 'Xception';
    const expectedMessage = 'test';
    const expectedMeta = {};
    const expectedCause = { message: 'test' };

    const result = xception(input);

    expect(result).toBeInstanceOf(Xception);
    expect(result.name).toEqual(expectedName);
    expect(result.message).toEqual(expectedMessage);
    expect(result[$meta]).toEqual(expectedMeta);
    expect(result.cause).toEqual(expectedCause);
  });

  it('should ignore any xception instance', () => {
    const cause = new Error('test');
    const xceptionError = new Xception('test', { cause });
    const expectedJson = xceptionError.toJSON();
    const expectedCause = cause;

    const result = xception(xceptionError);

    expect(result.toJSON()).toEqual(expectedJson);
    expect(result.cause).toEqual(expectedCause);
  });

  it('should wrap non-error values as an Xception', () => {
    const input = 1;
    const expectedMessage = 'non-error: 1';
    const expectedCause = 1;

    const result = xception(input);

    expect(result.message).toEqual(expectedMessage);
    expect(result.cause).toEqual(expectedCause);
  });

  it('should change the namespace of an Xception', () => {
    const original = new Xception('message', { namespace: 'original' });
    const expectedNamespace = 'new';

    const result = xception(original, { namespace: expectedNamespace });

    expect(result.namespace).toEqual(expectedNamespace);
  });

  it('should merge metadata of an Xception', () => {
    const original = new Xception('message', {
      meta: { bar: 'bar', foo: 'foo' },
    });
    const expectedMeta = {
      bar: 'new',
      foo: 'foo',
      new: 'new',
    };

    const result = xception(original, {
      meta: { bar: 'new', new: 'new' },
    });

    expect(result.meta).toEqual(expectedMeta);
  });

  it('should merge tags of an Xception', () => {
    const original = new Xception('message', { tags: ['foo', 'bar'] });
    const expectedTags = ['foo', 'bar', 'new'];

    const result = xception(original, { tags: ['new', 'bar'] });

    expect(result.tags).toEqual(expectedTags);
  });
});

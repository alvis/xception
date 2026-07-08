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

import { $code, $meta, $severity } from '#symbols';
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
    expect(result[$severity]).toEqual('error');
    expect(result[$code]).toBeUndefined();
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
      expect(result[$severity]).toEqual('error');
      expect(result[$code]).toBeUndefined();
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
    expect(result[$severity]).toEqual('error');
    expect(result[$code]).toBeUndefined();
  });

  it('should not inherit severity or code from a non-Xception error-like object', () => {
    const input = {
      message: 'test',
      [$severity]: 'fatal',
      [$code]: 'billing:rate_limited',
    };

    const result = xception(input);

    expect(result.severity).toEqual('error');
    expect(result.code).toBeUndefined();
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
    expect(result[$severity]).toEqual('error');
    expect(result[$code]).toBeUndefined();
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

  it('should inherit severity when wrapping an Xception', () => {
    const original = new Xception('message', { severity: 'warning' });

    const result = xception(original);

    expect(result.severity).toEqual('warning');
  });

  it('should override inherited severity when explicitly supplied', () => {
    const original = new Xception('message', { severity: 'fatal' });

    const result = xception(original, { severity: 'info' });

    expect(result.severity).toEqual('info');
  });

  it('should not inherit code when wrapping an Xception', () => {
    const original = new Xception('message', {
      severity: 'warning',
      code: 'auth:token_expired',
    });

    const result = xception(original);

    expect(result.code).toBeUndefined();
  });

  it('should apply code when explicitly supplied', () => {
    const original = new Xception('message', { code: 'auth:token_expired' });

    const result = xception(original, { code: 'api:request_failed' });

    expect(result.code).toEqual('api:request_failed');
  });

  it('should pass severity and code to the factory', () => {
    const original = new Error('test');

    const result = xception(original, {
      severity: 'fatal',
      code: 503,
      factory: (message, options) => new Xception(message, options),
    });

    expect(result.severity).toEqual('fatal');
    expect(result.code).toEqual(503);
  });
});

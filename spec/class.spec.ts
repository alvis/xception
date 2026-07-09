/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on createXceptionClass
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2026 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { describe, expect, expectTypeOf, it } from 'vitest';

import { Xception } from '#base';

import { createXceptionClass } from '#class';
import { $brands } from '#symbols';

import type { XceptionOptions } from '#base';

describe('fn:createXceptionClass', () => {
  it('should create a branded Xception subclass with typed meta and defaults', () => {
    const NotFoundError = createXceptionClass<{ resource: string }>(
      'NotFoundError',
      {
        code: 'ERR_NOT_FOUND',
        severity: 'warning',
      },
    );
    const error = new NotFoundError('missing', {
      meta: { resource: 'user' },
      namespace: 'http',
    });

    expectTypeOf(error.meta).toEqualTypeOf<{ resource: string }>();
    expectTypeOf<
      ConstructorParameters<typeof NotFoundError>[1]
    >().toEqualTypeOf<XceptionOptions<{ resource: string }> | undefined>();

    expect(error).toBeInstanceOf(Xception);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toEqual(
      expect.objectContaining({
        name: 'NotFoundError',
        message: 'missing',
        namespace: 'http',
        meta: { resource: 'user' },
        code: 'ERR_NOT_FOUND',
        severity: 'warning',
      }),
    );
    expect(error.stack?.split('\n')[0]).toEqual('NotFoundError: missing');
    expect(NotFoundError.brand).toEqual(Symbol.for('xception.NotFoundError'));
    expect('getBrands' in error).toBe(false);
    expect((error as unknown as { [$brands](): string[] })[$brands]()).toEqual([
      'xception',
      'xception.NotFoundError',
    ]);
  });

  it('should allow instance options to override defaults and replace meta', () => {
    const ValidationError = createXceptionClass<{
      field: string;
      reason?: string;
    }>('ValidationError', {
      code: 'ERR_VALIDATION',
      severity: 'error',
      meta: { field: 'email', reason: 'required' },
    });
    const error = new ValidationError('invalid', {
      code: 'ERR_PASSWORD',
      meta: { field: 'password' },
    });

    expect(error).toEqual(
      expect.objectContaining({
        code: 'ERR_PASSWORD',
        severity: 'error',
        meta: { field: 'password' },
      }),
    );
  });

  it('should cascade defaults through branded inheritance', () => {
    const NotFoundError = createXceptionClass<{ resource: string }>(
      'NotFoundError',
      {
        code: 'ERR_NOT_FOUND',
        severity: 'warning',
      },
    );
    const UserNotFoundError = createXceptionClass<{ userId: string }>(
      'UserNotFoundError',
      {
        base: NotFoundError,
        code: 'ERR_USER_NOT_FOUND',
      },
    );
    const error = new UserNotFoundError('gone', { meta: { userId: '42' } });

    expect(error).toBeInstanceOf(Xception);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(UserNotFoundError);
    expect(error).toEqual(
      expect.objectContaining({
        code: 'ERR_USER_NOT_FOUND',
        severity: 'warning',
        meta: { userId: '42' },
      }),
    );
    expect((error as unknown as { [$brands](): string[] })[$brands]()).toEqual([
      'xception',
      'xception.NotFoundError',
      'xception.UserNotFoundError',
    ]);
  });

  it('should support duplicate-package instanceof checks via the shared brand', () => {
    const LocalNotFoundError = createXceptionClass('NotFoundError');
    const RemoteNotFoundError = createXceptionClass('NotFoundError');
    const error = new LocalNotFoundError('missing');

    expect(LocalNotFoundError).not.toBe(RemoteNotFoundError);
    expect(LocalNotFoundError.brand).toBe(RemoteNotFoundError.brand);
    expect(error).toBeInstanceOf(LocalNotFoundError);
    expect(error).toBeInstanceOf(RemoteNotFoundError);
  });

  it('should fall back to inherited brands when symbol keys are unavailable', () => {
    const TestError = createXceptionClass('TestError');
    const error = new TestError('missing');
    const originalKeyFor = Symbol.keyFor;

    Symbol.keyFor = () => undefined;

    try {
      expect(
        (error as unknown as { [$brands](): string[] })[$brands](),
      ).toEqual(['xception']);
    } finally {
      Symbol.keyFor = originalKeyFor;
    }
  });
});

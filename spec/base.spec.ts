/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on Xception
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { describe, expect, it } from 'vitest';

import { Xception } from '#base';
import { createXceptionClass } from '#class';
import { $cause, $code, $meta, $namespace, $severity, $tags } from '#symbols';

import type { JsonObject } from 'type-fest';

class NewError extends Xception {
  constructor(options?: { cause?: unknown }) {
    super('new error', { ...options, tags: ['new'] });
  }
}

function createSerializedError(
  message: string,
  overrides: Record<string, unknown> = {},
): JsonObject {
  return {
    severity: 'error',
    name: 'Xception',
    message,
    meta: {},
    tags: [],
    stack: `Xception: ${message}`,
    ...overrides,
  } as JsonObject;
}

function createSerializedChain(depth: number): JsonObject {
  let current = createSerializedError(`level ${depth}`);

  for (let index = depth - 1; index >= 0; index -= 1) {
    current = createSerializedError(`level ${index}`, { cause: current });
  }

  return current;
}

function getCauseMessages(error: Xception): string[] {
  const messages: string[] = [];
  let current: unknown = error;

  while (current instanceof Xception) {
    messages.push(current.message);
    current = current.cause;
  }

  return messages;
}

function getLastCause(error: Xception): unknown {
  let current = error;

  while (current.cause instanceof Xception) {
    current = current.cause;
  }

  return current.cause;
}

function getExtendedError(): Xception {
  try {
    throw new Error('message');
  } catch (cause) {
    return new Xception('extended', {
      cause,
      namespace: 'test:xception',
      meta: { name: 'xception' },
      tags: ['extended'],
    });
  }
}

function getNewError(): Xception {
  try {
    throw (() => getExtendedError())();
  } catch (cause) {
    return new NewError({ cause });
  }
}

describe('cl:Xception', () => {
  const extendedError = getExtendedError();
  const newError = getNewError();

  describe('fromJSON', () => {
    it('should round-trip a serialized Xception graph', () => {
      const original = new Xception('outer', {
        namespace: 'billing',
        meta: { requestId: 'req_123' },
        tags: ['api'],
        severity: 'warning',
        code: 'billing:rate_limited',
        cause: new Xception('inner', {
          namespace: 'database',
          meta: { query: 'select * from invoices' },
          tags: ['db'],
          severity: 'info',
          code: 'db:timeout',
        }),
      });

      const revived = Xception.fromJSON(original.toJSON());

      expect(revived).toBeInstanceOf(Xception);
      expect(revived.cause).toBeInstanceOf(Xception);
      expect(revived.message).toEqual('outer');
      expect(revived.namespace).toEqual('billing');
      expect(revived.meta).toEqual({ requestId: 'req_123' });
      expect(revived.tags).toEqual(['db', 'api']);
      expect(revived.severity).toEqual('warning');
      expect(revived.code).toEqual('billing:rate_limited');
      expect(revived.toJSON()).toEqual(original.toJSON());
    });

    it('should reconstruct string causes as Error instances', () => {
      const revived = Xception.fromJSON(
        createSerializedError('request failed', { cause: 'socket hang up' }),
      );

      expect(revived.cause).toBeInstanceOf(Error);
      expect(revived.cause).not.toBeInstanceOf(Xception);
      expect((revived.cause as Error).message).toEqual('socket hang up');
    });

    it('should default missing or invalid optional fields', () => {
      const revived = Xception.fromJSON({
        message: 'partial',
        name: 42,
        stack: false,
        namespace: 99,
        meta: 'invalid',
        tags: 'invalid',
        severity: 'panic',
        code: true,
        cause: [],
      } as unknown as JsonObject);

      expect(revived.name).toEqual('Xception');
      expect(revived.stack).toContain('Xception: partial');
      expect(revived.namespace).toBeUndefined();
      expect(revived.meta).toEqual({});
      expect(revived.tags).toEqual([]);
      expect(revived.severity).toEqual('error');
      expect(revived.code).toBeUndefined();
      expect(revived.cause).toBeUndefined();
    });

    it('should preserve serialized stacks as strings', () => {
      const revived = Xception.fromJSON(
        createSerializedError('stacked', {
          name: 'AuthError',
          stack: 'AuthError: stacked\n    at remote-service:1:1',
        }),
      );

      expect(revived.name).toEqual('AuthError');
      expect(revived.stack).toEqual(
        'AuthError: stacked\n    at remote-service:1:1',
      );
    });

    it('should preserve circular reference placeholders in meta', () => {
      const meta: Record<string, unknown> = {};
      meta.self = meta;
      const original = new Xception('loop', { meta });

      const revived = Xception.fromJSON(original.toJSON());

      expect(revived.meta).toEqual({
        self: '[circular reference as .]',
      });
    });

    it('should throw TypeError for non-object input', () => {
      for (const value of [null, 'invalid', 123, true, []]) {
        // @ts-expect-error check validation
        expect(() => Xception.fromJSON(value)).toThrowError(
          new TypeError('Xception.fromJSON expects a non-null object'),
        );
      }
    });

    it('should throw TypeError when message is missing or invalid', () => {
      expect(() =>
        Xception.fromJSON({ name: 'Broken' } as JsonObject),
      ).toThrowError(
        new TypeError('Xception.fromJSON expects "message" to be a string'),
      );
      expect(() =>
        Xception.fromJSON({ message: 404 } as unknown as JsonObject),
      ).toThrowError(
        new TypeError('Xception.fromJSON expects "message" to be a string'),
      );
    });

    it('should throw TypeError for malformed nested causes', () => {
      expect(() =>
        Xception.fromJSON(
          createSerializedError('outer', {
            cause: { name: 'BrokenCause' },
          }),
        ),
      ).toThrowError(
        new TypeError('Xception.fromJSON expects "message" to be a string'),
      );
    });

    it('should call the reviver for each error cause-first', () => {
      const seen: string[] = [];

      const revived = Xception.fromJSON(
        createSerializedError('outer', {
          cause: createSerializedError('inner'),
        }),
        {
          reviver: (json, defaults) => {
            seen.push(json.message as string);

            return new Xception(json.message as string, defaults);
          },
        },
      );

      expect(seen).toEqual(['inner', 'outer']);
      expect(revived.cause).toBeInstanceOf(Xception);
    });

    it('should fall back to the default constructor when the reviver returns undefined', () => {
      const revived = Xception.fromJSON(
        createSerializedError('auth failed', {
          name: 'AuthError',
          namespace: 'auth',
        }),
        {
          reviver: () => undefined,
        },
      );

      expect(revived).toBeInstanceOf(Xception);
      expect(revived.name).toEqual('AuthError');
      expect(revived.namespace).toEqual('auth');
    });

    it('should revive branded subclasses that pass instanceof checks', () => {
      const AuthError = createXceptionClass<{ scope: string }>('AuthError', {
        namespace: 'auth',
      });
      const original = new AuthError('access denied', {
        meta: { scope: 'admin' },
        tags: ['auth'],
        code: 'auth:forbidden',
      });

      const revived = Xception.fromJSON(original.toJSON(), {
        reviver: (json, defaults) =>
          json.name === 'AuthError'
            ? new AuthError(json.message as string, defaults)
            : undefined,
      });

      expect(revived).toBeInstanceOf(Xception);
      expect(revived).toBeInstanceOf(AuthError);
      expect(revived.name).toEqual('AuthError');
      expect(revived.namespace).toEqual('auth');
      expect(revived.meta).toEqual({ scope: 'admin' });
      expect(revived.tags).toEqual(['auth']);
      expect(revived.code).toEqual('auth:forbidden');
    });

    it('should truncate the cause chain at the default max depth', () => {
      const revived = Xception.fromJSON(createSerializedChain(55));

      expect(getCauseMessages(revived)).toHaveLength(51);
      expect(getCauseMessages(revived).at(-1)).toEqual('level 50');
      expect((revived.cause as Xception).cause).toBeInstanceOf(Xception);
      expect(getLastCause(revived)).toBeUndefined();
    });

    it('should truncate the cause chain at a custom max depth', () => {
      const revived = Xception.fromJSON(createSerializedChain(3), {
        maxDepth: 1,
      });

      expect(getCauseMessages(revived)).toEqual(['level 0', 'level 1']);
      expect((revived.cause as Xception).cause).toBeUndefined();
    });

    it('should reject revivers that return non-Xception values', () => {
      expect(() =>
        Xception.fromJSON(createSerializedError('broken'), {
          reviver: () => ({}) as unknown as Xception,
        }),
      ).toThrowError(
        new TypeError(
          'Xception.fromJSON reviver must return an Xception instance or undefined',
        ),
      );
    });
  });

  describe('constructor', () => {
    it('should embed the wrapped error', () => {
      const cause = new Error('message');
      const expected = cause;

      const xception = new Xception('extended', {
        cause,
      });

      expect(xception[$cause]).toEqual(expected);
    });

    it('should specify the namespace when supplied', () => {
      const expected = 'test:xception';

      expect(extendedError[$namespace]).toEqual(expected);
    });

    it('should embed the metadata when supplied', () => {
      const expected = { name: 'xception' };

      expect(extendedError[$meta]).toEqual(expected);
    });

    it('should pass tags to the inherited class', () => {
      const expected = ['extended', 'new'];

      expect(newError[$tags]).toEqual(expected);
    });

    it('should keep its own stack if the attached error has no stack', () => {
      const error = new Xception('message', {
        cause: { name: 'GenericError', message: 'error' },
      });

      expect(error.stack).not.toContain('GenericError');
    });

    it('should take a normal error if no origin is attached', () => {
      const expectedTags = ['tag'];
      const error = new Xception('message', { tags: expectedTags });

      expect(error.stack).toContain('Xception');
      expect(error[$tags]).toEqual(expectedTags);
    });

    it('should default severity to error', () => {
      const error = new Xception('message');

      expect(error[$severity]).toEqual('error');
    });

    it('should store severity and code when supplied', () => {
      const error = new Xception('message', {
        severity: 'fatal',
        code: 'sys:oom',
      });

      expect(error[$severity]).toEqual('fatal');
      expect(error[$code]).toEqual('sys:oom');
    });

    it('should inherit severity from an Xception cause', () => {
      const cause = new Xception('cause', { severity: 'warning' });
      const error = new Xception('message', { cause });

      expect(error[$severity]).toEqual('warning');
    });

    it('should not inherit code from an Xception cause', () => {
      const cause = new Xception('cause', {
        severity: 'warning',
        code: 'billing:rate_limited',
      });
      const error = new Xception('message', { cause });

      expect(error[$severity]).toEqual('warning');
      expect(error[$code]).toBeUndefined();
    });

    it('should bear the right error type', () => {
      const expectedExtendedName = 'Xception';
      const expectedNewName = 'NewError';

      expect(extendedError.name).toEqual(expectedExtendedName);
      expect(newError.name).toEqual(expectedNewName);
    });
  });

  describe('getter', () => {
    it('should return the cause', () => {
      const expected = new Error('message');

      expect(extendedError.cause).toEqual(expected);
    });

    it('should return the namespace', () => {
      const expected = 'test:xception';

      expect(extendedError.namespace).toEqual(expected);
    });

    it('should return the metadata', () => {
      const expected = { name: 'xception' };

      expect(extendedError.meta).toEqual(expected);
    });

    it('should return the tags', () => {
      const expected = ['extended'];

      expect(extendedError.tags).toEqual(expected);
    });

    it('should return the severity', () => {
      const error = new Xception('message', { severity: 'info' });

      expect(error.severity).toEqual('info');
    });

    it('should return the code', () => {
      const error = new Xception('message', { code: 'auth:token_expired' });

      expect(error.code).toEqual('auth:token_expired');
    });
  });

  describe('toJSON', () => {
    it('should return a jsonifiable object', () => {
      const expectedSimple = {
        severity: 'error',
        name: 'Xception',
        message: 'message',
        meta: {},
        tags: [],
        stack: expect.any(String),
      };
      const expectedExtended = {
        severity: 'error',
        name: 'Xception',
        message: 'extended',
        meta: { name: 'xception' },
        namespace: 'test:xception',
        tags: ['extended'],
        stack: expect.any(String),
        cause: {
          name: 'Error',
          message: 'message',
          stack: expect.any(String),
        },
      };

      expect(new Xception('message').toJSON()).toEqual(expectedSimple);
      expect(extendedError.toJSON()).toEqual(expectedExtended);
    });

    it('should include code when defined', () => {
      const error = new Xception('message', {
        severity: 'warning',
        code: 'billing:rate_limited',
      });

      expect(error.toJSON()).toEqual({
        severity: 'warning',
        code: 'billing:rate_limited',
        name: 'Xception',
        message: 'message',
        meta: {},
        tags: [],
        stack: expect.any(String),
      });
    });
  });
});

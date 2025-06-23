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
import { $cause, $meta, $namespace, $tags } from '#symbols';

class NewError extends Xception {
  constructor(options?: { cause?: unknown }) {
    super('new error', { ...options, tags: ['new'] });
  }
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
  });

  describe('toJSON', () => {
    it('should return a jsonifiable object', () => {
      const expectedSimple = {
        name: 'Xception',
        message: 'message',
        meta: {},
        tags: [],
        stack: expect.any(String),
      };
      const expectedExtended = {
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
  });

  describe('render', () => {
    it('should render the error', async () => {
      const result = await extendedError.render({ showSource: true });

      expect(result).toEqual(expect.stringContaining('test:xception'));
    });
  });
});

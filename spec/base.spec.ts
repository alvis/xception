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

import { ansi } from './ansi';

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
      const xception = new Xception('extended', {
        cause,
      });

      expect(xception[$cause]).toEqual(cause);
    });

    it('should specify the namespace when supplied', () => {
      expect(extendedError[$namespace]).toEqual('test:xception');
    });

    it('should embed the metadata when supplied', () => {
      expect(extendedError[$meta]).toEqual({ name: 'xception' });
    });

    it('should pass tags to the inherited class', () => {
      expect(newError[$tags]).toEqual(['extended', 'new']);
    });

    it('should keep its own stack if the attached error has no stack', () => {
      const error = new Xception('message', {
        cause: { name: 'GenericError', message: 'error' },
      });

      expect(error.stack).not.toContain('GenericError');
    });

    it('should take a normal error if no origin is attached', () => {
      const error = new Xception('message', { tags: ['tag'] });

      expect(error.stack).toContain('Xception');
      expect(error[$tags]).toEqual(['tag']);
    });

    it('should bear the right error type', () => {
      expect(extendedError.name).toEqual('Xception');
      expect(newError.name).toEqual('NewError');
    });
  });

  describe('getter', () => {
    it('should return the cause', () => {
      expect(extendedError.cause).toEqual(new Error('message'));
    });

    it('should return the namespace', () => {
      expect(extendedError.namespace).toEqual('test:xception');
    });

    it('should return the metadata', () => {
      expect(extendedError.meta).toEqual({ name: 'xception' });
    });

    it('should return the tags', () => {
      expect(extendedError.tags).toEqual(['extended']);
    });
  });

  describe('render', () => {
    it('should render the error', () => {
      const rendered = extendedError.render().replace(ansi, '');

      expect(rendered).toContain('[Xception] extended');
      expect(rendered).toContain('at');
    });
  });

  describe('toJSON', () => {
    it('should return a jsonifiable object', () => {
      expect(new Xception('message').toJSON()).toEqual({
        name: 'Xception',
        message: 'message',
        meta: {},
        tags: [],
        stack: expect.any(String),
      });

      expect(extendedError.toJSON()).toEqual({
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
      });
    });
  });
});

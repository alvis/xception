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

import { Xception } from '#prototype';

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

  it('should embed the wrapped error', () => {
    const cause = new Error('message');
    const xception = new Xception('extended', {
      cause,
    });

    expect(xception.cause).toEqual(cause);
  });

  it('should specify the namespace when supplied', () => {
    expect(extendedError.namespace).toEqual('test:xception');
  });

  it('should embed the metadata when supplied', () => {
    expect(extendedError.meta).toEqual({ name: 'xception' });
  });

  it('should pass tags to the inherited class', () => {
    expect(newError.tags).toEqual(['extended', 'new']);
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
    expect(error.tags).toEqual(['tag']);
  });

  it('should bear the right error type', () => {
    expect(extendedError.name).toEqual('Xception');
    expect(newError.name).toEqual('NewError');
  });

  it('should contain previous stacks', () => {
    expect(newError.stack).toContain('NewError: new error');
    expect(newError.stack).toContain('Xception: extended');
    expect(newError.stack).toContain('Error: message');
  });
});

getExtendedError();

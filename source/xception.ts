/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Wrap an error as an Xception instance
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2023 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { isErrorLike } from '#isErrorLike';
import { jsonify } from '#jsonify';
import { Xception } from '#prototype';
import { $meta, $namespace, $tags } from '#symbols';

import type { JsonObject } from 'type-fest';

import type { ErrorLike } from '#isErrorLike';
import type { XceptionOptions } from '#prototype';

/**
 * convert an error to an Xception instance with metadata merged while preserving the original error message and stack
 * @param exception an exception to be converted
 * @param options additional options for the error
 * @param options.meta meta data to be embedded in the error
 * @returns the transformed error
 */
export default function xception(
  exception: unknown, // string, error, Xception, { message: string, ...}
  options?: Omit<XceptionOptions, 'cause'>,
): Xception {
  const { namespace, meta = {}, tags = [] } = { ...options };

  if (isErrorLike(exception)) {
    const error = createXceptionFromError(exception);

    // merge the namespace
    error[$namespace] = namespace ?? error[$namespace];

    // merge the meta data
    error[$meta] = { ...error[$meta], ...meta };

    // merge the tags
    error[$tags] = [...new Set([...error[$tags], ...tags])];

    // replace the name and stack from the original error
    error.name = exception.name ?? error.name;
    error.stack = exception.stack ?? error.stack;

    return error;
  } else if (typeof exception === 'string') {
    return new Xception(exception, options);
  }

  throw new Xception('unexpected exception type', {
    ...options,
    cause: exception,
  });
}

/**
 * convert an error-like object to an Xception instance
 * @param exception an exception to be converted
 * @returns the transformed error
 */
export function createXceptionFromError(exception: ErrorLike): Xception {
  if (exception instanceof Xception) {
    return exception;
  } else {
    const {
      name: _name,
      message: _message,
      stack: _stack,
      ...meta
    } = jsonify(exception) as JsonObject;

    return new Xception(exception.message, {
      meta,
    });
  }
}

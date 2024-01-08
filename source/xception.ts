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
import { Xception } from '#prototype';
import { $meta, $namespace, $tags } from '#symbols';

import type { ErrorLike } from '#isErrorLike';
import type { XceptionOptions } from '#prototype';

type Options = Omit<XceptionOptions, 'cause'> & {
  factory?: (message: string, options: XceptionOptions) => Xception;
};

/**
 * convert an error to an Xception instance with metadata merged while preserving the original error message and stack
 * @param exception an exception to be converted
 * @param options additional options for the error
 * @param options.meta meta data to be embedded in the error
 * @returns the transformed error
 */
export default function xception(
  exception: unknown, // string, error, Xception, { message: string, ...}
  options?: Options,
): Xception {
  // when options.factory is provided, it's used to create Xception instances; otherwise, the default constructor is used
  const factory =
    options?.factory ??
    ((message: string, options?: XceptionOptions) =>
      new Xception(message, options));

  if (isErrorLike(exception)) {
    // fetch defaults if provided in options, or use properties of the original exception
    const { namespace, meta, tags } = computeDefaults(exception, options);

    // create a new Xception with the original error's message and computed options
    const error = factory(exception.message, { namespace, meta, tags });

    // replace the name and stack from the original error
    error.name = exception.name ?? error.name;
    error.stack = exception.stack ?? error.stack;

    return error;
  } else if (typeof exception === 'string') {
    // if exception is a string, we create a new Xception with the given message and options
    const { namespace, meta, tags } = { ...options };

    return factory(exception, { namespace, meta, tags });
  }

  // if exception is of unexpected type, throw a new Xception indicating the problem
  throw new Xception('unexpected exception type', {
    ...options,
    cause: exception,
  });
}

/**
 * compute defaults for namespace, meta, and tags by combining the ones present on the exception and the provided options
 * @param exception the original exception-like object
 * @param options additional options provided for generating the `Xception` instance
 * @returns an object containing computed namespace, meta, and tags to be used for the new `Xception`
 */
function computeDefaults(
  exception: ErrorLike,
  options?: Options,
): {
  namespace?: string;
  meta: Record<string, unknown>;
  tags: string[];
} {
  // if a namespace is provided in options, use it, otherwise use the original exception's namespace, if any
  const namespace =
    options?.namespace ?? (exception[$namespace] as string | undefined);

  // merge metadata from the original exception and options
  const meta = {
    ...(exception[$meta] as Record<string, unknown>),
    ...options?.meta,
  };

  // concatenate and deduplicate tags from both the exception and the options
  const tags = [
    ...new Set([
      ...((exception[$tags] as string[] | undefined) ?? []),
      ...(options?.tags ?? []),
    ]),
  ];

  return { namespace, meta, tags };
}

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

import { Xception } from '#base';
import { isErrorLike } from '#isErrorLike';
import { $meta, $namespace, $severity, $tags } from '#symbols';

import type { Severity, XceptionOptions } from '#base';
import type { ErrorLike } from '#isErrorLike';

type Options<Meta extends Record<string, unknown> = Record<string, unknown>> =
  Omit<XceptionOptions<Meta>, 'cause'> & {
    factory?: (
      message: string,
      options: XceptionOptions<Meta>,
    ) => Xception<Meta>;
  };

/**
 * convert an error to an Xception instance with metadata merged while preserving the original error message and stack
 * @param exception an exception to be converted
 * @param options additional options for the error
 * @param options.meta meta data to be embedded in the error
 * @returns the transformed error
 */
export default function xception<
  Meta extends Record<string, unknown> = Record<string, unknown>,
>(
  exception: unknown, // string, error, Xception, { message: string, ...}
  options?: Options<Meta>,
): Xception<Meta> {
  const cause = exception instanceof Xception ? exception.cause : exception;

  // when options.factory is provided, it's used to create Xception instances; otherwise, the default constructor is used
  const factory =
    options?.factory ??
    ((message: string, options?: XceptionOptions<Meta>) =>
      new Xception<Meta>(message, options));

  if (isErrorLike(exception)) {
    // fetch defaults if provided in options, or use properties of the original exception
    const { namespace, meta, tags, severity, code } = computeDefaults(
      exception,
      options,
    );

    // create a new Xception with the original error's message and computed options
    const error = factory(exception.message, {
      namespace,
      meta,
      tags,
      severity,
      code,
      cause,
    });

    // replace the name and stack from the original error
    error.name = exception.name ?? error.name;
    error.stack = exception.stack ?? error.stack;

    return error;
  }

  // create a new Xception with the given message and options
  const { namespace, meta, tags, severity, code } = { ...options };

  // try to extract the message from the exception, otherwise use a generic message
  const message = `non-error: ${String(exception)}`;

  return factory(message, { namespace, meta, tags, severity, code, cause });
}

/**
 * compute defaults for namespace, meta, and tags by combining the ones present on the exception and the provided options
 * @param exception the original exception-like object
 * @param options additional options provided for generating the `Xception` instance
 * @returns an object containing computed namespace, meta, and tags to be used for the new `Xception`
 */
function computeDefaults<
  Meta extends Record<string, unknown> = Record<string, unknown>,
>(
  exception: ErrorLike,
  options?: Options<Meta>,
): {
  namespace?: string;
  meta: Meta;
  tags: string[];
  severity: Severity;
  code?: number | string;
} {
  // if a namespace is provided in options, use it, otherwise use the original exception's namespace, if any
  const namespace =
    options?.namespace ?? (exception[$namespace] as string | undefined);

  // merge metadata from the original exception and options
  const meta = {
    ...(exception[$meta] as Meta),
    ...options?.meta,
  };

  // concatenate and deduplicate tags from both the exception and the options
  const tags = [
    ...new Set([
      ...((exception[$tags] as string[] | undefined) ?? []),
      ...(options?.tags ?? []),
    ]),
  ];

  const severity =
    options?.severity ??
    (exception instanceof Xception
      ? (exception[$severity] as Severity | undefined)
      : undefined) ??
    'error';

  const code = options?.code;

  return { namespace, meta, tags, severity, code };
}

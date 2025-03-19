/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Determine if an exception is an error-like object
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2023 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

export type ErrorLike =
  | Error
  | {
      /** error metadata */
      [key: string | symbol]: unknown;
      /** error message */
      message: string;
      /** error name */
      name?: string;
      /** error stack */
      stack?: string;
    };

/**
 * determine if an exception is an error-like object
 * @param exception an exception to be tested
 * @returns whether the exception is an error-like object
 */
export function isErrorLike(exception: unknown): exception is ErrorLike {
  const isObject = typeof exception === 'object' && exception !== null;

  const hasMessage =
    isObject &&
    typeof (exception as Record<string, unknown>).message === 'string';
  const hasName =
    isObject &&
    (!('name' in exception) ||
      typeof (exception as Record<string, unknown>).name === 'string');
  const hasStack =
    isObject &&
    (!('stack' in exception) ||
      typeof (exception as Record<string, unknown>).stack === 'string');

  return isObject && hasMessage && hasName && hasStack;
}

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
  return (
    typeof exception === 'object' &&
    exception !== null &&
    typeof exception['message'] === 'string' &&
    (typeof exception['name'] === 'string' ||
      exception['name'] === undefined) &&
    (typeof exception['stack'] === 'string' || exception['stack'] === undefined)
  );
}

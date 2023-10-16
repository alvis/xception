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

import { Xception } from './prototype';

import type { JsonObject } from 'type-fest';

/**
 * convert an error to an Xception instance with metadata merged while preserving the original error message and stack
 * @param error the error to be converted
 * @param options additional options for the error
 * @param options.meta meta data to be embedded in the error
 * @returns the transformed error
 */
export function xceptionalize(
  error: Error,
  options?: { meta?: JsonObject },
): Xception {
  const { meta = {} } = { ...options };

  const wrappedError =
    error instanceof Xception ? error : new Xception(error.message);

  wrappedError.name = error.name;
  wrappedError.meta = { ...wrappedError.meta, ...meta };
  wrappedError.stack = error.stack;

  return wrappedError;
}

/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Base64 utilities
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2023 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

/**
 * decodes a base64-encoded string
 * @param base64 the base64-encoded string
 * @returns the decoded string
 */
export function base64Decode(base64: string): string {
  return (atob as typeof atob | undefined)
    ? atob(base64) // use atob in browsers
    : Buffer.from(base64, 'base64').toString('utf-8'); // use Buffer in node
}

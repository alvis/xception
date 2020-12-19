/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Definition for yamlify-object
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import type { Chalk } from 'chalk';

// declare module 'yamlify-object' {
declare function yamlify(
  source: Record<string, unknown>,
  options?: {
    indent?: string;
    prefix?: string;
    postfix?: string;
    dateToString?(date: Date): string;
    errorToString?(error: Error): string;
    colors?: Record<
      | 'date'
      | 'error'
      | 'symbol'
      | 'string'
      | 'number'
      | 'boolean'
      | 'null'
      | 'undefined',
      (content: string) => string
    >;
  },
): string;

export default yamlify;
// }

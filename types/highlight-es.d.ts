/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Definition for highlight-es
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import type { Chalk } from 'chalk';

declare module 'highlight-es' {
  declare function highlight(
    source: string,
    theme: Record<
      | 'string'
      | 'punctuator'
      | 'keyword'
      | 'number'
      | 'regex'
      | 'comment'
      | 'invalid',
      Chalk
    >,
  ): string;
  export default highlight;
}

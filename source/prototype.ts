/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { assembleStack, disassembleStack } from './stack';

/** a high-order error that combine previous stack and tags */
export class Xception extends Error {
  /** upstream error */
  public cause?: unknown;

  /** error namespace */
  public namespace?: string;

  /** running context */
  public meta: Record<string, unknown>;

  /** additional associations */
  public tags: string[];

  /**
   * @param message error message
   * @param options additional options for the error
   * @param options.cause upstream error
   * @param options.namespace namespace of the error
   * @param options.meta context where the error occur
   * @param options.tags additional associations for the error
   */
  constructor(
    message: string,
    options?: {
      cause?: unknown;
      namespace?: string;
      meta?: Record<string, unknown>;
      tags?: string[];
    },
  ) {
    const { cause, namespace, meta = {}, tags = [] } = { ...options };

    super(message);
    this.cause = cause;
    this.namespace = namespace;
    this.meta = meta;

    // fix the name of the error class being 'Error'
    this.name = this.constructor.name;

    // enrich the stack
    this.stack =
      cause instanceof Error && cause.stack && this.stack
        ? [
            // the error message and the location where the error is formed
            assembleStack(
              disassembleStack(this.stack).slice(
                0,
                // description + location
                1 + 1,
              ),
            ),
            cause.stack,
          ].join('\n')
        : this.stack;

    // attach tags to the error
    this.tags = cause instanceof Xception ? [...cause.tags, ...tags] : tags;
  }
}

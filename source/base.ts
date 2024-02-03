/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Base class for Xception
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { jsonify } from '#jsonify';
import { renderError } from '#render';
import { $cause, $meta, $namespace, $tags } from '#symbols';

import type { JsonObject } from 'type-fest';

import type { RenderOptions } from '#render';

export interface XceptionOptions {
  /** upstream error */
  cause?: unknown;
  /** error namespace */
  namespace?: string;
  /** context where the error occur */
  meta?: Record<string, unknown>;
  /** additional associations for the error */
  tags?: string[];
}

/** a high-order error that combine previous stack and tags */
export class Xception extends Error {
  /** upstream error */
  protected [$cause]?: unknown;

  /** error namespace */
  protected [$namespace]?: string;

  /** running context */
  protected [$meta]: Record<string, unknown>;

  /** additional associations */
  protected [$tags]: string[];

  /**
   * @param message error message
   * @param options additional options for the error
   */
  constructor(message: string, options?: XceptionOptions) {
    const { namespace, cause, meta = {}, tags = [] } = { ...options };

    super(message);

    // fix the name of the error class being 'Error'
    this.name = this.constructor.name;

    // assign namespace, cause & meta
    this[$namespace] = namespace;
    this[$cause] = cause;
    this[$meta] = meta;

    // attach tags
    this[$tags] = cause instanceof Xception ? [...cause[$tags], ...tags] : tags;
  }

  /**
   * get the upstream error
   */
  public get cause(): unknown {
    return this[$cause];
  }

  /**
   * get the error namespace
   */
  public get namespace(): string | undefined {
    return this[$namespace];
  }

  /**
   * get the running context
   */
  public get meta(): Record<string, unknown> {
    return this[$meta];
  }

  /**
   * get the additional associations
   */
  public get tags(): string[] {
    return this[$tags];
  }

  /**
   * render the error to a string
   * @param options optional parameters
   * @returns a rendered string to print
   */
  public render(options?: RenderOptions): string {
    return renderError(this, options);
  }

  /**
   * convert the error to a jsonifiable object
   * @returns a jsonifiable object
   */
  public toJSON(): JsonObject {
    return {
      ...(this[$namespace] ? { namespace: this[$namespace] } : {}),
      name: this.name,
      message: this.message,
      stack: this.stack!,
      ...(this[$cause] ? { cause: jsonify(this[$cause]) } : {}),
      meta: jsonify(this[$meta]),
      tags: this[$tags],
    };
  }
}

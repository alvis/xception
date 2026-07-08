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
import { $cause, $code, $meta, $namespace, $severity, $tags } from '#symbols';

import type { JsonObject } from 'type-fest';

export type Severity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface XceptionOptions {
  /** upstream error */
  cause?: unknown;
  /** error namespace */
  namespace?: string;
  /** context where the error occur */
  meta?: Record<string, unknown>;
  /** additional associations for the error */
  tags?: string[];
  /** error severity */
  severity?: Severity;
  /** machine-readable error code */
  code?: number | string;
}

const XCEPTION = Symbol.for('xception');

/** a high-order error that combine previous stack and tags */
export class Xception extends Error {
  public [XCEPTION] = true;

  /** upstream error */
  protected [$cause]?: unknown;

  /** error namespace */
  protected [$namespace]?: string;

  /** running context */
  protected [$meta]: Record<string, unknown>;

  /** additional associations */
  protected [$tags]: string[];

  /** error severity */
  protected [$severity]: Severity;

  /** machine-readable error code */
  protected [$code]?: number | string;

  /**
   * @param message error message
   * @param options additional options for the error
   */
  constructor(message: string, options?: XceptionOptions) {
    const {
      namespace,
      cause,
      meta = {},
      tags = [],
      severity,
      code,
    } = {
      ...options,
    };

    super(message);

    // fix the name of the error class being 'Error'
    this.name = this.constructor.name;

    // assign namespace, cause & meta
    this[$namespace] = namespace;
    this[$cause] = cause;
    this[$meta] = meta;
    this[$severity] =
      severity ?? (cause instanceof Xception ? cause[$severity] : 'error');
    this[$code] = code;

    // attach tags
    this[$tags] =
      cause instanceof Xception
        ? [...new Set([...cause[$tags], ...tags])]
        : tags;
  }

  /** get the upstream error */
  public get cause(): unknown {
    return this[$cause];
  }

  /** get the error namespace */
  public get namespace(): string | undefined {
    return this[$namespace];
  }

  /**
   * get the running context
   */
  public get meta(): Record<string, unknown> {
    return this[$meta];
  }

  /** get the additional associations */
  public get tags(): string[] {
    return this[$tags];
  }

  /** get the error severity */
  public get severity(): Severity {
    return this[$severity];
  }

  /** get the machine-readable error code */
  public get code(): number | string | undefined {
    return this[$code];
  }

  /**
   * determine whether a value should be treated as an Xception instance
   * @param instance the value to test
   * @returns whether the value carries the Xception marker symbol
   */
  public static [Symbol.hasInstance](instance: unknown): instance is Xception {
    return (
      typeof instance === 'object' &&
      instance !== null &&
      Symbol.for('xception') in instance
    );
  }

  /**
   * convert the error to a jsonifiable object
   * @returns a jsonifiable object
   */
  public toJSON(): JsonObject {
    return {
      severity: this[$severity],
      ...(this[$code] !== undefined ? { code: this[$code] } : {}),
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

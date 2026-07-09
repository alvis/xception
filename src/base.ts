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

import {
  assertSerializedError,
  isJsonObject,
  normalizeMaxDepth,
  readCode,
  readMeta,
  readOptionalString,
  readSeverity,
  readTags,
} from '#fromJson';
import { jsonify } from '#jsonify';
import {
  $brands,
  $cause,
  $code,
  $meta,
  $namespace,
  $severity,
  $tags,
} from '#symbols';

import type { JsonObject } from 'type-fest';

export type Severity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface XceptionOptions<
  Meta extends Record<string, unknown> = Record<string, unknown>,
> {
  /** upstream error */
  cause?: unknown;
  /** error namespace */
  namespace?: string;
  /** context where the error occur */
  meta?: Meta;
  /** additional associations for the error */
  tags?: string[];
  /** error severity */
  severity?: Severity;
  /** machine-readable error code */
  code?: number | string;
}

export interface FromJSONOptions {
  /** custom factory for producing subclasses */
  reviver?: (
    json: JsonObject,
    defaults: XceptionOptions,
  ) => Xception | undefined;
  /** max cause chain depth */
  maxDepth?: number;
}

const XCEPTION = Symbol.for('xception');

/** a high-order error that combine previous stack and tags */
export class Xception<
  Meta extends Record<string, unknown> = Record<string, unknown>,
> extends Error {
  public [XCEPTION] = true;

  /** upstream error */
  protected [$cause]?: unknown;

  /** error namespace */
  protected [$namespace]?: string;

  /** running context */
  protected [$meta]: Meta;

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
  constructor(message: string, options?: XceptionOptions<Meta>) {
    const {
      namespace,
      cause,
      meta = {} as Meta,
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

  /** get the running context */
  public get meta(): Meta {
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
   * reconstruct an Xception instance from a serialized json object
   * @param json the serialized error payload
   * @param options reviver and recursion controls
   * @returns the reconstructed error
   */
  public static fromJSON(
    json: JsonObject,
    options?: FromJSONOptions,
  ): Xception {
    return fromJson(json, options);
  }

  /**
   * collect all runtime brands attached to this error
   * @returns the internal brand chain for this instance
   */
  public [$brands](): string[] {
    return [Symbol.keyFor(XCEPTION) ?? 'xception'];
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

/**
 * reconstruct a serialized error object and its cause chain
 * @param json the serialized error payload for the current level
 * @param options reviver and recursion controls
 * @param depth the current cause-chain depth from the root
 * @returns the reconstructed Xception instance
 */
function fromJson(
  json: JsonObject,
  options: FromJSONOptions | undefined,
  depth = 0,
): Xception {
  assertSerializedError(json);

  const maxDepth = normalizeMaxDepth(options?.maxDepth);
  const rawCause = 'cause' in json ? json.cause : undefined;
  const cause =
    rawCause === null || rawCause === undefined
      ? undefined
      : typeof rawCause === 'string'
        ? new Error(rawCause)
        : !isJsonObject(rawCause)
          ? undefined
          : depth >= maxDepth
            ? undefined
            : fromJson(rawCause, options, depth + 1);
  const defaults: XceptionOptions = {
    cause,
    namespace: readOptionalString(json.namespace),
    meta: readMeta(json.meta),
    tags: readTags(json.tags),
    severity: readSeverity(json.severity),
    code: readCode(json.code),
  };
  const revived =
    options?.reviver?.(json, defaults) ?? new Xception(json.message, defaults);

  if (!(revived instanceof Xception)) {
    throw new TypeError(
      'Xception.fromJSON reviver must return an Xception instance or undefined',
    );
  }

  revived.name = readOptionalString(json.name) ?? 'Xception';

  const stack = readOptionalString(json.stack);

  if (stack !== undefined) {
    revived.stack = stack;
  }

  return revived;
}

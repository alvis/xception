/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Factory for creating branded Xception subclasses
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2026 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { Xception } from '#base';
import { $brands } from '#symbols';

import type { XceptionOptions } from '#base';

type XceptionMeta = Record<string, unknown>;

export type XceptionConstructor<Meta extends XceptionMeta = XceptionMeta> =
  new (message: string, options?: XceptionOptions<Meta>) => Xception<Meta>;

type XceptionClass<Meta extends XceptionMeta = XceptionMeta> =
  XceptionConstructor<Meta> & {
    prototype: Xception<Meta>;
  };

export interface CreateXceptionClassOptions<
  Meta extends XceptionMeta = XceptionMeta,
> extends XceptionOptions<Meta> {
  base?: XceptionClass<any>;
}

type BrandedXceptionConstructor<Meta extends XceptionMeta> =
  XceptionClass<Meta> & {
    /** runtime brand key for this class */
    readonly brand: symbol;
  };

/**
 * create a branded Xception subclass with cascading defaults
 * @param name class name used for stacks and instance names
 * @param options class-level defaults and inheritance settings
 * @returns a branded Xception subclass
 */
export function createXceptionClass<Meta extends XceptionMeta = XceptionMeta>(
  name: string,
  options?: CreateXceptionClassOptions<Meta>,
): BrandedXceptionConstructor<Meta> {
  const { base, ...defaultOptions } = options ?? {};
  const baseClass = (base ?? Xception) as XceptionClass<any>;
  const brand = Symbol.for(`xception.${name}`);

  const derivedClass = {
    /** Xception subclass carrying the configured runtime brand. */
    [name]: class extends baseClass {
      public readonly [brand] = true;

      /**
       * @param message the error message for the instance
       * @param instanceOptions per-instance options that override class defaults
       */
      constructor(message: string, instanceOptions?: XceptionOptions<Meta>) {
        const merged = {
          ...defaultOptions,
          ...instanceOptions,
          meta: instanceOptions?.meta ?? defaultOptions.meta,
        } as XceptionOptions<Meta>;

        super(message, merged);

        this.name = name;
      }

      /** Runtime brand shared by classes created with the same name. */
      public static get brand(): symbol {
        return brand;
      }

      /**
       * determine whether a value carries this subclass brand
       * @param instance the value to test
       * @returns whether the value is branded as this subclass
       */
      public static [Symbol.hasInstance](instance: unknown): boolean {
        return (
          typeof instance === 'object' &&
          instance !== null &&
          (instance as Record<PropertyKey, unknown>)[brand] === true
        );
      }

      /**
       * collect the full internal brand chain for this subclass instance
       * @returns the deduplicated brand chain
       */
      public [$brands](): string[] {
        const brandKey = Symbol.keyFor(brand);

        return brandKey
          ? [...new Set([...super[$brands](), brandKey])]
          : super[$brands]();
      }
    },
  }[name] as unknown as BrandedXceptionConstructor<Meta>;

  return derivedClass;
}

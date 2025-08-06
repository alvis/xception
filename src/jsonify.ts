/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Make a value printable
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2023 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import type { JsonObject, JsonValue } from 'type-fest';

const JSONIFIABLE_TYPES = ['boolean', 'number', 'string', 'object'];

/**
 * convert a value to a printable value
 * @param value an object to be converted
 * @returns a printable value
 */
export function jsonify(value: unknown): JsonValue {
  return jsonifyWithPath(value, new Map(), ['.']);
}

/**
 * check if a value is a circular reference
 * @param value an object to be checked
 * @param processed a map of processed objects
 * @param paths the path to the object
 * @returns a circular reference string if it is a circular reference or null otherwise
 */
function circularReference(
  value: unknown,
  processed: Map<object, string>,
  paths: string[],
): string | null {
  if (typeof value === 'object' && value !== null) {
    const path = processed.get(value);
    if (path && paths.join('.').startsWith(path)) {
      return `[circular reference as ${path}]`;
    }
  }

  return null;
}

/**
 * convert a value to a printable value
 * @param value an object to be converted
 * @param processed a map of processed objects
 * @param paths the path to the object
 * @returns a printable value
 */
function jsonifyWithPath(
  value: unknown,
  processed: Map<object, string>,
  paths: string[],
): JsonValue {
  if (Array.isArray(value)) {
    return jsonifyArrayWithPath(value, processed, paths);
  } else if (typeof value === 'object' && value !== null) {
    return jsonifyObjectWithPath(value, processed, paths);
  } else if (
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string' ||
    value === null
  ) {
    return value;
  }

  return `[typeof ${typeof value}]`;
}

/**
 * convert an array to a json-compatible array
 * @param value an array to be converted
 * @param processed a map of processed objects
 * @param paths the path to the object
 * @returns a json-compatible array
 */
function jsonifyArrayWithPath(
  value: unknown[],
  processed: Map<object, string>,
  paths: string[],
): JsonValue[] {
  // mark the array as processed
  processed.set(value, paths.join('.'));

  return value.map(
    (value, key) =>
      circularReference(value, processed, paths) ??
      jsonifyWithPath(value, processed, [...paths, `${key}`]),
  );
}

/**
 * convert an object to a json-compatible object
 * @param value an object to be converted
 * @param processed a map of processed objects
 * @param paths the path to the object
 * @returns a json-compatible object
 */
function jsonifyObjectWithPath(
  value: object,
  processed: Map<object, string>,
  paths: string[],
): JsonObject {
  // mark the object as processed
  processed.set(value, paths.join('.'));

  const toJSON: unknown = (value as Record<string, unknown>).toJSON;

  if (typeof toJSON === 'function') {
    // use the toJSON method if available
    return toJSON.apply(value) as JsonObject;
  } else {
    const properties = Object.fromEntries(
      Object.entries(value)
        // ignore function, symbols etc.
        .filter(([_key, value]) => JSONIFIABLE_TYPES.includes(typeof value))
        .map(([key, value]) => [
          key,
          circularReference(value, processed, paths) ??
            jsonifyWithPath(value, processed, [...paths, key]),
        ]),
    );

    return value instanceof Error
      ? {
          ...properties,
          message: value.message,
          name: value.name,
          stack: value.stack!,
        }
      : properties;
  }
}

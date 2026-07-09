/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Shared helpers for Xception JSON deserialization
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2026 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import type { JsonObject } from 'type-fest';

const VALID_SEVERITIES = [
  'fatal',
  'error',
  'warning',
  'info',
  'debug',
] as const;
const DEFAULT_MAX_DEPTH = 50;

type SerializedSeverity = (typeof VALID_SEVERITIES)[number];

/**
 * assert that a value has the minimum serialized Xception shape
 * @param value the candidate serialized payload
 */
export function assertSerializedError(
  value: unknown,
): asserts value is JsonObject & {
  message: string;
} {
  if (!isJsonObject(value)) {
    throw new TypeError('Xception.fromJSON expects a non-null object');
  }

  if (typeof value.message !== 'string') {
    throw new TypeError('Xception.fromJSON expects "message" to be a string');
  }
}

/**
 * determine whether a value can be treated as a JSON object
 * @param value the value to inspect
 * @returns whether the value is a non-null object and not an array
 */
export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * extract an optional string field from serialized input
 * @param value the field value to normalize
 * @returns the string value when present
 */
export function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/**
 * normalize the serialized metadata payload
 * @param value the serialized meta field
 * @returns a plain object or an empty object fallback
 */
export function readMeta(value: unknown): Record<string, unknown> {
  return isJsonObject(value) ? (value as Record<string, unknown>) : {};
}

/**
 * normalize the serialized tag list
 * @param value the serialized tags field
 * @returns the string tags preserved from the payload
 */
export function readTags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((tag): tag is string => typeof tag === 'string')
    : [];
}

/**
 * normalize the serialized severity field
 * @param value the serialized severity value
 * @returns a valid severity or the default error severity
 */
export function readSeverity(value: unknown): SerializedSeverity {
  return isSeverity(value) ? value : 'error';
}

/**
 * normalize the serialized code field
 * @param value the serialized code value
 * @returns the machine-readable code when it is string or number
 */
export function readCode(value: unknown): number | string | undefined {
  return typeof value === 'number' || typeof value === 'string'
    ? value
    : undefined;
}

/**
 * clamp the configured cause depth to a safe integer value
 * @param value the caller-supplied max depth
 * @returns the safe max depth used during recursive deserialization
 */
export function normalizeMaxDepth(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_MAX_DEPTH;
  }

  return Math.max(0, Math.floor(value));
}

/**
 * determine whether a value is one of the supported severities
 * @param value the candidate severity value
 * @returns whether the value is a valid serialized severity member
 */
export function isSeverity(value: unknown): value is SerializedSeverity {
  return (
    typeof value === 'string' &&
    VALID_SEVERITIES.includes(value as SerializedSeverity)
  );
}

/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on fromJson utilities
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2026 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { describe, expect, it } from 'vitest';

import {
  assertSerializedError,
  isJsonObject,
  isSeverity,
  normalizeMaxDepth,
  readCode,
  readMeta,
  readOptionalString,
  readSeverity,
  readTags,
} from '#fromJson';

describe('mod:fromJsonUtils', () => {
  it('should recognize json objects', () => {
    expect(isJsonObject({})).toBeTruthy();
    expect(isJsonObject([])).toBeFalsy();
    expect(isJsonObject(null)).toBeFalsy();
    expect(isJsonObject('xception')).toBeFalsy();
  });

  it('should validate serialized payloads', () => {
    expect(() => assertSerializedError({ message: 'ok' })).not.toThrowError();
    expect(() => assertSerializedError([])).toThrowError(
      new TypeError('Xception.fromJSON expects a non-null object'),
    );
    expect(() => assertSerializedError({ name: 'Broken' })).toThrowError(
      new TypeError('Xception.fromJSON expects "message" to be a string'),
    );
  });

  it('should normalize optional string fields', () => {
    expect(readOptionalString('auth')).toEqual('auth');
    expect(readOptionalString(42)).toBeUndefined();
  });

  it('should normalize meta payloads', () => {
    expect(readMeta({ requestId: 'req_123' })).toEqual({
      requestId: 'req_123',
    });
    expect(readMeta('invalid')).toEqual({});
  });

  it('should normalize tags by filtering to strings', () => {
    expect(readTags(['api', 42, 'retryable'])).toEqual(['api', 'retryable']);
    expect(readTags('invalid')).toEqual([]);
  });

  it('should normalize severity values', () => {
    expect(isSeverity('warning')).toBeTruthy();
    expect(isSeverity('panic')).toBeFalsy();
    expect(readSeverity('info')).toEqual('info');
    expect(readSeverity('panic')).toEqual('error');
  });

  it('should normalize codes and max depth values', () => {
    expect(readCode('auth:forbidden')).toEqual('auth:forbidden');
    expect(readCode(404)).toEqual(404);
    expect(readCode(false)).toBeUndefined();
    expect(normalizeMaxDepth(undefined)).toEqual(50);
    expect(normalizeMaxDepth(3.8)).toEqual(3);
    expect(normalizeMaxDepth(-4)).toEqual(0);
  });
});

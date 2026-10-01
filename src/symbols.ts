/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Symbols used in the prototype
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

// NOTE: every key is registry-global so that an instance created by one copy of
// this module (e.g. a second bundled copy in the same process) keeps its state
// readable by another copy, which a module-local Symbol() would hide
export const $namespace: unique symbol = Symbol.for('xception.namespace');
export const $tags: unique symbol = Symbol.for('xception.tags');
export const $cause: unique symbol = Symbol.for('xception.cause');
export const $meta: unique symbol = Symbol.for('xception.meta');
export const $severity: unique symbol = Symbol.for('xception.severity');
export const $code: unique symbol = Symbol.for('xception.code');
export const $brands: unique symbol = Symbol.for('xception.brands');

/* v8 ignore start */

/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Collection of exports
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

export * from '#base';
export { Xception as default } from '#base';
export { createXceptionClass } from '#class';
export { default as xception } from '#xception';

export type { CreateXceptionClassOptions, XceptionConstructor } from '#class';

// expose internals for companion packages (e.g. sher.log)
export { $namespace, $tags, $cause, $meta, $severity, $code } from '#symbols';
export { jsonify } from '#jsonify';
export { isErrorLike } from '#isErrorLike';
export type { ErrorLike } from '#isErrorLike';

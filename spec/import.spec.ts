/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on importing
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { jest } from '@jest/globals';

const importNodeFs = jest.fn(() => ({
  existsSync: (path: string) => true,
  readFileSync: (path: string) => Buffer.from(''),
}));
jest.unstable_mockModule('node:fs', importNodeFs);

const { importFs } = await import('#import');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('importFs', () => {
  it('should import node:fs under a node environment', async () => {
    await importFs();

    expect(importNodeFs).toHaveBeenCalled();
  });

  it('should not import node:fs under a browser environment', async () => {
    const originalProcess = globalThis;
    (globalThis.process as any) = undefined;

    const { existsSync, readFileSync } = await importFs();

    expect(importNodeFs).not.toHaveBeenCalled();

    expect(existsSync('/')).toEqual(false);
    expect(readFileSync('/')).toEqual(Buffer.from(''));

    (globalThis.process as any) = originalProcess;
  });
});

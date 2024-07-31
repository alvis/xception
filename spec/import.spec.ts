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

import { describe, expect, it, vi } from 'vitest';

import { importFs } from '#import';

const { importNodeFs } = vi.hoisted(() => ({
  importNodeFs: vi.fn(() => ({
    existsSync: (path: string) => true,
    readFileSync: (path: string) => Buffer.from(''),
  })),
}));
vi.mock('node:fs', importNodeFs);

describe('importFs', () => {
  it('should import node:fs under a node environment', async () => {
    await importFs();

    expect(importNodeFs).toHaveBeenCalled();
  });

  it('should not import node:fs under a browser environment', async () => {
    vi.stubGlobal('process', { versions: {} });

    const { existsSync, readFileSync } = await importFs();

    expect(importNodeFs).not.toHaveBeenCalled();

    expect(existsSync('/')).toEqual(false);
    expect(readFileSync('/')).toEqual(Buffer.from(''));
  });
});

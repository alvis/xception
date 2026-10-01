/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on state symbols shared across module copies
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2026 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { describe, expect, it, vi } from 'vitest';

type Copy = typeof import('#index');

/**
 * load an independent instance of the whole module graph, as a second bundled
 * copy of xception in the same process would be
 * @returns the freshly evaluated module namespace
 */
async function loadCopy(): Promise<Copy> {
  vi.resetModules();

  return import('#index');
}

const copyA = await loadCopy();
const copyB = await loadCopy();

describe('two module copies', () => {
  it('should evaluate each copy into its own class', () => {
    expect(copyB.Xception).not.toBe(copyA.Xception);
  });

  it('should resolve every state symbol to the same registry-global key', () => {
    const pick = ({
      $cause,
      $code,
      $meta,
      $namespace,
      $severity,
      $tags,
    }: Copy): Record<string, symbol> => ({
      $cause,
      $code,
      $meta,
      $namespace,
      $severity,
      $tags,
    });

    expect(pick(copyB)).toEqual(pick(copyA));
  });

  it('should treat an instance from another copy as an Xception', () => {
    const error = new copyA.Xception('from copy A');

    expect(error).toBeInstanceOf(copyB.Xception);
  });

  it('should treat a named subclass instance from another copy as that subclass', () => {
    const NotFoundA = copyA.createXceptionClass('NotFoundError');
    const NotFoundB = copyB.createXceptionClass('NotFoundError');

    expect(new NotFoundA('missing')).toBeInstanceOf(NotFoundB);
  });

  it('should inherit severity and merge tags when wrapping a cause from another copy', () => {
    const cause = new copyA.Xception('inner', {
      severity: 'warning',
      tags: ['inner'],
    });

    const error = new copyB.Xception('outer', { cause, tags: ['outer'] });

    expect(error).toEqual(
      expect.objectContaining({
        cause,
        severity: 'warning',
        tags: ['inner', 'outer'],
      }),
    );
  });

  it('should carry namespace, meta and tags when converting an error from another copy', () => {
    const cause = new copyA.Xception('inner', {
      namespace: 'copy:a',
      meta: { id: 1 },
      tags: ['inner'],
      severity: 'warning',
    });

    const error = copyB.xception(cause, { tags: ['outer'] });

    expect(error).toEqual(
      expect.objectContaining({
        namespace: 'copy:a',
        meta: { id: 1 },
        tags: ['inner', 'outer'],
        severity: 'warning',
      }),
    );
  });

  it('should serialize an error whose cause comes from another copy', () => {
    const cause = new copyA.Xception('inner', { code: 'E_INNER' });

    const error = new copyB.Xception('outer', { cause });

    expect(error.toJSON()).toEqual(
      expect.objectContaining({
        cause: expect.objectContaining({ code: 'E_INNER', message: 'inner' }),
      }),
    );
  });
});

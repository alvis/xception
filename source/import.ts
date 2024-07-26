/**
 * get the file system module to avoid loading helpers from fs in a browser environment
 * @returns the file system module
 */
export async function importFs(): Promise<{
  existsSync: (path: string) => boolean;
  readFileSync: (path: string) => Buffer;
}> {
  const { existsSync, readFileSync } =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    globalThis.process?.versions.node
      ? await import('node:fs')
      : { existsSync: () => false, readFileSync: () => Buffer.from('') };

  return { existsSync, readFileSync };
}

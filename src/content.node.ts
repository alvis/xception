import { existsSync, readFileSync } from 'node:fs';

/**
 * decodes a base64-encoded string
 * @param base64 the base64-encoded string
 * @returns the decoded string
 */
export function decodeBase64(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf-8'); // use Buffer in node
}

/**
 * retrieves the content of a web resource from a given URL
 * @param url the URL of the resource
 * @returns the resource content or null if the request fails
 */
export async function fetchWebContent(url: string): Promise<string | null> {
  const response = await fetch(url);

  // return the content only if the response is successful
  return response.ok ? response.text() : null;
}

/**
 * reads the content of a local file if it exists and is accessible
 * @param url the file URL or path
 * @returns the file content as a string, or null if the file does not exist
 */
export async function readLocalContent(url: string): Promise<string | null> {
  const path = url.replace(/^file:\/\//, ''); // remove the file:// prefix

  return existsSync(path) ? readFileSync(path).toString() : null;
}

/**
 * decodes a base64-encoded string
 * @param base64 the base64-encoded string
 * @returns the decoded string
 */
export function decodeBase64(base64: string): string {
  return atob(base64); // use atob in browsers
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
 * @param _url the file URL or path
 * @returns null since this function is not implemented in a browser environment
 */
export async function readLocalContent(_url: string): Promise<string | null> {
  // always return null in a browser environment
  return null;
}

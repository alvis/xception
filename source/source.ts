/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Load and parse sources
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2023 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { SourceMapConsumer } from 'source-map-js';

import { base64Decode } from '#base64';

import type { RawSourceMap } from 'source-map-js';

export interface SourceResolution {
  /** name of path of the original source */
  identifier: string;
  /** content of the original source */
  source?: string;
  /** line number of the original source */
  line: number;
  /** column number of the original source */
  column: number;
}

export type SourceResolver = (params: {
  line: number;
  column: number;
}) => SourceResolution;

// regular expression to match inline source maps
const sourceMapRegex =
  /\/\/# sourceMappingURL=data:application\/json;.*base64,(.+)$/m;

/**
 * creates a resolver function to map source details for a given identifier
 * @param identifier the source identifier (URL or file path)
 * @returns a function to retrieve mapped source details or the original source details if mapping fails
 */
export async function createSourceResolver(
  identifier: string,
): Promise<SourceResolver> {
  const source = /^https?:\/\/.*/.exec(identifier)
    ? await fetchWebContent(identifier) // load from web if URL is HTTP/HTTPS
    : await readLocalFile(identifier); // load from local file otherwise

  if (!source) {
    return ({ line, column }) => ({ identifier, line, column });
  }

  const matches = sourceMapRegex.exec(source);

  const fallback: SourceResolver = ({ line, column }) => {
    return { identifier, source, line, column };
  };

  if (!matches) {
    return fallback;
  }

  return createSourceResolverWithSource(identifier, source);
}

/**
 * reads the content of a local file if it exists and is accessible
 * @param url the file URL or path
 * @returns the file content as a string, or null if the file does not exist or the environment is not Node.js
 */
export async function readLocalFile(url: string): Promise<string | null> {
  const path = url.replace(/^file:\/\//, ''); // remove the file:// prefix

  // check if running in a Node.js environment
  if (globalThis.process.versions.node) {
    const { existsSync, readFileSync } = await import('fs'); // dynamically import node.js file system module

    return existsSync(path) ? readFileSync(path).toString() : null;
  }

  // if running in a browser environment, return null
  return null;
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
 * create a source resolver based on a source with an inline source map
 * @param identifier the identifier of the source content
 * @param source the source content potentially containing an inline source map
 * @returns a function to resolve the original source details
 */
export function createSourceResolverWithSource(
  identifier: string,
  source: string,
): SourceResolver {
  const matches = sourceMapRegex.exec(source);

  const fallback: SourceResolver = ({ line, column }) => {
    return { identifier, source, line, column };
  };

  if (!matches) {
    return fallback;
  }

  return ({ line, column }) => {
    const sourceMapBase64 = matches[1];
    const rawSourceMap = JSON.parse(
      base64Decode(sourceMapBase64),
    ) as RawSourceMap; // decode and parse the source map

    // use SourceMapConsumer to map to the original source
    const consumer = new SourceMapConsumer(rawSourceMap);

    const originalLocation = consumer.originalPositionFor({ line, column });
    const originalSource = consumer.sourceContentFor(
      originalLocation.source,
      true,
    );

    return originalSource
      ? {
          identifier: originalLocation.source,
          source: originalSource,
          line: originalLocation.line,
          column: originalLocation.column,
        }
      : fallback({ line, column });
  };
}

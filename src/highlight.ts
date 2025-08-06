/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Highlight JavaScript/TypeScript code with syntax coloring
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2024 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import jsTokens from 'js-tokens';

import type { ChalkInstance } from 'chalk';

/** Theme type for syntax highlighting */
export type HighlightTheme = Record<
  | 'string'
  | 'punctuator'
  | 'keyword'
  | 'number'
  | 'regex'
  | 'comment'
  | 'invalid',
  ChalkInstance
>;

// comprehensive list of JavaScript and TypeScript keywords
const keywords = new Set([
  // JavaScript Keywords //
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'extends',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'let',
  'new',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
  'await',
  'async',
  // Literals //
  'null',
  'true',
  'false',
  // TypeScript Keywords //
  'abstract',
  'as',
  'asserts',
  'any',
  'boolean',
  'constructor',
  'declare',
  'enum',
  'from',
  'get',
  'implements',
  'interface',
  'is',
  'keyof',
  'module',
  'namespace',
  'never',
  'number',
  'object',
  'of',
  'package',
  'private',
  'protected',
  'public',
  'readonly',
  'require',
  'string',
  'set',
  'static',
  'symbol',
  'type',
  'undefined',
  'unique',
  'unknown',
  'satisfies',
]);

/**
 * highlight JavaScript/TypeScript source code with syntax coloring
 * @param source the source code to highlight
 * @param theme the color theme mapping token types to chalk styles
 * @returns the highlighted source code with ANSI color codes
 */
export function highlight(source: string, theme: HighlightTheme): string {
  // tokenize and transform each token to highlighted text
  const highlighted = Array.from(jsTokens(source)).map(({ type, value }) => {
    // map js-tokens types to our theme keys
    switch (type) {
      case 'StringLiteral':
      case 'NoSubstitutionTemplate':
      case 'TemplateHead':
      case 'TemplateMiddle':
      case 'TemplateTail':
        // apply string theme color
        return theme.string(value);

      case 'Punctuator':
        // apply punctuator theme color
        return theme.punctuator(value);

      case 'IdentifierName':
        // check if it's a keyword or regular identifier
        return keywords.has(value) ? theme.keyword(value) : value;

      case 'NumericLiteral':
        // apply number theme color
        return theme.number(value);

      case 'RegularExpressionLiteral':
        // apply regex theme color
        return theme.regex(value);

      case 'SingleLineComment':
      case 'MultiLineComment':
        // apply comment theme color
        return theme.comment(value);

      case 'Invalid':
        // apply invalid theme color
        return theme.invalid(value);

      case 'WhiteSpace':
      case 'LineTerminatorSequence':
      default:
        // preserve whitespace and unrecognized tokens as-is
        return value;
    }
  });

  return highlighted.join('');
}

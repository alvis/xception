/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on highlight
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2024 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { Chalk } from 'chalk';
import { describe, expect, it } from 'vitest';

import { highlight } from '#highlight';

import type { HighlightTheme } from '#highlight';

describe('fn:highlight', () => {
  // create a no-color theme for testing text preservation
  const noColorChalk = new Chalk({ level: 0 });
  const noColorTheme: HighlightTheme = {
    string: noColorChalk.green,
    punctuator: noColorChalk.gray,
    keyword: noColorChalk.cyan,
    number: noColorChalk.magenta,
    regex: noColorChalk.yellow,
    comment: noColorChalk.blue,
    invalid: noColorChalk.red,
  };

  // create a colored theme for testing ANSI code presence
  const colorChalk = new Chalk({ level: 3 });
  const colorTheme: HighlightTheme = {
    string: colorChalk.green,
    punctuator: colorChalk.gray,
    keyword: colorChalk.cyan,
    number: colorChalk.magenta,
    regex: colorChalk.yellow,
    comment: colorChalk.blue,
    invalid: colorChalk.red,
  };

  it('should highlight string literals', () => {
    const source = `const message = "Hello, World!";`;
    const result = highlight(source, noColorTheme);

    // with no-color theme, output should be identical to input
    expect(result).toBe(source);
  });

  it('should preserve template literals', () => {
    // eslint-disable-next-line no-template-curly-in-string
    const source = 'const greeting = `Hello ${name}!`;';
    const result = highlight(source, noColorTheme);

    expect(result).toBe(source);
  });

  it('should preserve numbers', () => {
    const source = 'const pi = 3.14159; const hex = 0xFF;';
    const result = highlight(source, noColorTheme);

    expect(result).toBe(source);
  });

  it('should preserve keywords', () => {
    const source = 'if (true) { return false; } else { throw new Error(); }';
    const result = highlight(source, noColorTheme);

    expect(result).toBe(source);
  });

  it('should preserve TypeScript keywords', () => {
    const source = 'interface Foo { readonly bar: string; }';
    const result = highlight(source, noColorTheme);

    expect(result).toBe(source);
  });

  it('should preserve regular expressions', () => {
    const source = 'const pattern = /test\\d+/gi;';
    const result = highlight(source, noColorTheme);

    expect(result).toBe(source);
  });

  it('should preserve single-line comments', () => {
    const source = '// This is a comment\nconst x = 1;';
    const result = highlight(source, noColorTheme);

    expect(result).toBe(source);
  });

  it('should preserve multi-line comments', () => {
    const source = '/* This is\n   a multi-line\n   comment */\nconst y = 2;';
    const result = highlight(source, noColorTheme);

    expect(result).toBe(source);
  });

  it('should preserve punctuators', () => {
    const source = 'obj.prop = arr[0] + (a * b);';
    const result = highlight(source, noColorTheme);

    expect(result).toBe(source);
  });

  it('should preserve regular identifiers', () => {
    const source = 'const myVariable = someFunction();';
    const result = highlight(source, noColorTheme);

    expect(result).toBe(source);
  });

  it('should preserve whitespace', () => {
    const source = 'const x = 1;\n\tconst y = 2;';
    const result = highlight(source, noColorTheme);

    expect(result).toBe(source);
  });

  it('should apply colors when using colored theme', () => {
    const source = 'const greeting = "Hello"; // say hello';

    // expected output with ANSI color codes
    // cyan for 'const', gray for '=' and ';', green for string, blue for comment
    const expected =
      '\x1b[36mconst\x1b[39m greeting \x1b[90m=\x1b[39m ' +
      '\x1b[32m"Hello"\x1b[39m\x1b[90m;\x1b[39m \x1b[34m// say hello\x1b[39m';

    const result = highlight(source, colorTheme);

    expect(result).toBe(expected);
  });

  it('should handle invalid tokens', () => {
    // a lone backslash is an invalid token in JavaScript
    const source = 'const x = \\';

    // with no-color theme, the invalid token is preserved as-is
    const noColorResult = highlight(source, noColorTheme);
    expect(noColorResult).toBe(source);

    // expected output with ANSI color codes
    // cyan for 'const', gray for '=', red for invalid backslash
    const expectedColor =
      '\x1b[36mconst\x1b[39m x \x1b[90m=\x1b[39m \x1b[31m\\\x1b[39m';

    const colorResult = highlight(source, colorTheme);

    expect(colorResult).toBe(expectedColor);
  });

  it('should handle empty source', () => {
    const source = '';
    const result = highlight(source, noColorTheme);

    expect(result).toBe('');
  });

  it('should handle source with only whitespace', () => {
    const source = '   \n\t  ';
    const result = highlight(source, noColorTheme);

    expect(result).toBe('   \n\t  ');
  });
});

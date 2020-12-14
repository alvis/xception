/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import highlight from 'highlight-es';

import { disassembleStack } from './stack';

import type { StackDescriptionBlock, StackLocationBlock } from './stack';

/** default number of lines from the targeted source line to be displayed */
const DEFAULT_SPREAD = 4;

const DEFAULT_CODE_THEME = {
  string: chalk.green,
  punctuator: chalk.grey,
  keyword: chalk.cyan,
  number: chalk.magenta,
  regex: chalk.magenta,
  comment: chalk.grey.bold,
  invalid: chalk.inverse,
};

/**
 * render a description line
 * @param block a stack block about an error description
 * @returns a rendered string to print
 */
function renderDescription(block: StackDescriptionBlock): string {
  const { name, message } = block;

  return chalk.red(`[${chalk.bold(name)}] ${message}`);
}

/**
 * render a location line
 * @param block a stack block about a location
 * @param options optional parameters
 * @param options.showSource indicate whether a source frame should be shown
 * @returns a rendered string to print
 */
function renderLocation(
  block: StackLocationBlock,
  options: { showSource: boolean },
): string {
  const { entry, path, line, column } = block;
  const { showSource } = { ...options };

  const location = `${path}:${line}:${column}`;

  const sourceFrame = showSource ? renderSource(block) : '';

  return (
    `    at ${chalk.grey.bold(entry)} (${chalk.grey.underline(location)})` +
    (sourceFrame ? '\n' + sourceFrame : '')
  );
}

/**
 * render a source frame
 * @param block a location block
 * @param options options for rendering
 * @param options.spread the number of lines from the targeted source line to be displayed
 * @returns a rendered string to print
 */
function renderSource(
  block: StackLocationBlock,
  options?: {
    spread?: number;
  },
): string {
  const { path, line } = block;
  const { spread = DEFAULT_SPREAD } = { ...options };

  // no source frame if the source is missing
  if (!existsSync(path)) {
    return '';
  }

  const content = readFileSync(path).toString();
  const highlighted = highlight(content, DEFAULT_CODE_THEME);
  const lines = highlighted.split(/[\r\n]/);
  const base = Math.max(line - spread - 1, 0);
  const displayLines = lines.slice(base, line + spread);
  const lineNumberWidth = (line + spread).toString().length;

  const sourceFrame = displayLines
    .map((source, index) => {
      const currentLine = base + index + 1;
      const formattedLine = currentLine.toString().padStart(lineNumberWidth);
      const isTarget = currentLine === line;
      const prefix = isTarget ? '>' : ' ';
      const gutter = ` ${prefix} ${formattedLine} `;

      return `${isTarget ? chalk.bgRed(gutter) : gutter}| ${source}`;
    })
    .join('\n');

  return '\n' + sourceFrame + '\n';
}

/**
 * render a highly readable error stack
 * @param error the error to be rendered
 * @param options optional parameters
 * @param options.showSource indicate whether a source frame should be shown
 * @returns a rendered string to print
 */
export function renderStack(
  error: Error,
  options?: {
    showSource?: boolean;
  },
): string {
  const { showSource = false } = { ...options };

  const blocks = disassembleStack(error.stack!);

  return blocks
    .map((block, index) =>
      block.type === 'location'
        ? renderLocation(block, {
            showSource:
              // NOTE a location block must follow a description block
              showSource && blocks[index - 1].type === 'description',
          })
        : renderDescription(block),
    )
    .join('\n');
}

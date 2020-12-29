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
import yamlify from 'yamlify-object';

import { Xception } from '#prototype';
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

const DEFAULT_YAML_THEME = {
  error: chalk.red,
  symbol: chalk.magenta,
  string: chalk.green,
  date: chalk.cyan,
  number: chalk.magenta,
  boolean: chalk.yellow,
  null: chalk.yellow.bold,
  undefined: chalk.yellow.bold,
};

/**
 * render associations of an error
 * @param error the related error
 * @returns a rendered string to print
 */
function renderAssociations(error: unknown): string | null {
  const blocks: string[] = [];

  if (error instanceof Xception && error.namespace) {
    blocks.push(chalk.blue.underline(error.namespace));
  }

  if (error instanceof Xception && error.tags.length) {
    blocks.push(...error.tags.map((tag) => chalk.cyan.bold(tag)));
  }

  return blocks.length ? '\n    ' + blocks.join(' ') : null;
}

/**
 * render a description line
 * @param block a stack block about an error description
 * @param error error the related error
 * @returns a rendered string to print
 */
function renderDescription(
  block: StackDescriptionBlock,
  error?: unknown,
): string {
  const { name, message } = block;
  const description = chalk.red(`[${chalk.bold(name)}] ${message}`);
  const association = renderAssociations(error);
  const meta = renderMeta(error);

  return [description, association, meta].filter((block) => !!block).join('\n');
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
 * render metadata in an error
 * @param error the related error
 * @returns a rendered string to print
 */
function renderMeta(error: unknown): string | null {
  return error instanceof Xception && Object.keys(error.meta).length
    ? yamlify(error.meta, {
        indent: '    ',
        prefix: '\n',
        postfix: '\n',
        colors: DEFAULT_YAML_THEME,
      })
    : null;
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
 * @param options.filter a filter determining whether a stack should be shown given the file path
 * @returns a rendered string to print
 */
export function renderStack(
  error: Error,
  options?: {
    showSource?: boolean;
    filter?: (path: string) => boolean;
  },
): string {
  const {
    showSource = false,
    filter = (path: string) => !path.includes('node:internal'),
  } = { ...options };

  const blocks = disassembleStack(error.stack!);

  let currentError: unknown = error;
  const renderedBlocks: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === 'location' && filter(block.path)) {
      renderedBlocks.push(
        renderLocation(block, {
          showSource:
            // NOTE a location block must follow a description block
            showSource && blocks[i - 1].type === 'description',
        }),
      );
    } else if (block.type === 'description') {
      renderedBlocks.push(renderDescription(block, currentError));
      currentError = error['cause'];
    }
  }

  return renderedBlocks.join('\n');
}

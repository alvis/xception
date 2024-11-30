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

import { existsSync, readFileSync } from 'node:fs';

import chalk from 'chalk';
import highlight from 'highlight-es';
import yamlify from 'yamlify-object';

import { jsonify } from '#jsonify';
import { disassembleStack } from '#stack';

import { $cause, $meta, $namespace, $tags } from './symbols';

import type { ChalkInstance } from 'chalk';
import type { JsonObject, JsonValue } from 'type-fest';

import type { ErrorLike } from '#isErrorLike';
import type { StackLocationBlock } from '#stack';

/** options for rendering an error */
export interface RenderOptions {
  /** indent for each line */
  indent?: string;
  /** indicate whether a source frame should be shown */
  showSource?: boolean;
  /** indicate whether the full stack should be shown */
  showStack?: boolean;
  /** a filter function determining whether a stack should be shown given the file path */
  filter?: (path: string) => boolean;
}

const PADDING = '    ';

/** default number of lines from the targeted source line to be displayed */
const SPREAD = 4;

const CODE_THEME = {
  string: chalk.green,
  punctuator: chalk.grey,
  keyword: chalk.cyan,
  number: chalk.magenta,
  regex: chalk.magenta,
  comment: chalk.grey.bold,
  invalid: chalk.inverse,
};

const YAML_THEME = {
  base: chalk.white,
  error: chalk.red,
  symbol: chalk.magenta,
  string: chalk.green,
  date: chalk.cyan,
  number: chalk.magenta,
  boolean: chalk.yellow,
  null: chalk.yellow.bold,
  undefined: chalk.yellow.bold,
};

const EXCESSIVE_NEWLINE = /(\n\s*){2,}\n/g;

/**
 * render an error in a human readable format
 * @param error the error to be rendered
 * @param options optional parameters
 * @returns a string representation of the error
 */
export function renderError(error: Error, options?: RenderOptions): string {
  const {
    indent = '',
    showSource = false,
    showStack = true,
    filter = (path: string) =>
      !path.includes('node:internal') && !path.includes('node_modules'),
  } = { ...options };

  const stack = getUniqueStack(error);

  const locations = disassembleStack(stack).filter(
    (block): block is StackLocationBlock =>
      showStack && block.type === 'location' && filter(block.path),
  );

  const renderedBlocks: string[] = [
    renderDescription(error, { indent }),
    ...locations.map((block, index) =>
      renderLocation(block, { indent, showSource: showSource && index === 0 }),
    ),
  ];

  // ('... 6 lines matching cause stack trace ...');

  if (error[$cause] instanceof Error) {
    renderedBlocks.push(
      chalk.grey(
        `${indent}${PADDING}... further lines matching cause stack trace below ...\n`,
      ),
      renderError(error[$cause], { ...options, indent: '  ' }),
    );
  }

  // join all rendered blocks and remove excessive new lines
  return renderedBlocks.join('\n').replace(EXCESSIVE_NEWLINE, '\n\n').trim();
}

/**
 * get the metadata of an error
 * @param error the error to be processed
 * @returns the metadata
 */
function getErrorMeta(error: ErrorLike): JsonObject {
  const meta = error[$meta] as JsonObject | undefined;

  if (meta) {
    return meta;
  } else {
    const {
      name: _name,
      message: _message,
      stack: _stack,
      ...properties
    } = jsonify(error) as JsonObject;

    return properties;
  }
}

/**
 * get the unique stack of an error
 * @param error the error to be processed
 * @returns the unique stack
 */
function getUniqueStack(error: Error): string {
  const cause = error[$cause] as unknown;

  if (cause instanceof Error) {
    const errorStack = error.stack!.split('\n');
    const causeStack = cause.stack!.split('\n');

    const commonStackStartAt = errorStack.findIndex((line) =>
      causeStack.includes(line),
    );

    return errorStack.splice(0, commonStackStartAt).join('\n');
  } else {
    return error.stack!;
  }
}

/**
 * render associations of an error
 * @param error the related error
 * @param options optional parameters
 * @param options.indent indent for each line
 * @returns a rendered string to print
 */
function renderAssociations(
  error: ErrorLike,
  options: { indent: string },
): string | null {
  const { indent } = options;

  const namespace = error[$namespace] as string | undefined;
  const tags = error[$tags] as string[] | undefined;

  const blocks = [
    ...(typeof namespace === 'string'
      ? [indent + chalk.blue.underline(namespace)]
      : []),
    ...(Array.isArray(tags)
      ? tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => indent + chalk.cyan.bold(tag))
      : []),
  ];

  return blocks.length ? `\n${indent}${PADDING}` + blocks.join(' ') : null;
}

/**
 * render a description line
 * @param error error the related error
 * @param options optional parameters
 * @param options.indent indent for each line
 * @returns a rendered string to print
 */
function renderDescription(
  error: ErrorLike,
  options: { indent: string },
): string {
  const { indent } = options;

  const description =
    indent + chalk.red(`[${chalk.bold(error.name)}] ${error.message}`);

  const association = renderAssociations(error, options);
  const meta = renderMeta(getErrorMeta(error), {
    indent,
    prefix: `\n${indent}${PADDING}${chalk.white.underline('METADATA')}\n`,
    postfix: '\n',
  });
  const cause =
    // NOTE: cause is rendered only if it is not an error
    error[$cause] && !(error[$cause] instanceof Error)
      ? renderMeta(jsonify(error[$cause]), {
          indent,
          prefix: `\n${indent}${PADDING}${chalk.white.underline('CAUSE')}\n`,
          postfix: '\n',
        })
      : null;

  return [description, association, meta, cause]
    .filter((block) => !!block)
    .join('\n');
}

/**
 * render a location line
 * @param block a stack block about a location
 * @param options optional parameters
 * @param options.indent indent for each line
 * @param options.showSource indicate whether a source frame should be shown
 * @returns a rendered string to print
 */
export function renderLocation(
  block: StackLocationBlock,
  options: { indent: string; showSource: boolean },
): string {
  const { entry, path, line, column } = block;
  const { indent, showSource } = options;

  const location = `${path}:${line}:${column}`;

  const sourceFrame = showSource ? renderSource(block, { indent }) : '';

  return (
    `${indent}${PADDING}at ${chalk.grey.bold(entry)} (${chalk.grey.underline(
      location,
    )})` + (sourceFrame ? '\n' + sourceFrame : '')
  );
}

/**
 * render metadata in an error
 * @param properties additional properties of an error
 * @param options optional parameters
 * @param options.indent indent for each line
 * @param options.prefix the prefix to be added before the rendered string
 * @param options.postfix the postfix to be added after the rendered string
 * @returns a rendered string to print
 */
function renderMeta(
  properties: JsonValue,
  options: { indent: string; prefix: string; postfix: string },
): string | null {
  const { indent, prefix, postfix } = options;

  if (properties instanceof Object && Object.keys(properties).length) {
    return yamlify(properties, {
      indent: indent + PADDING,
      prefix,
      postfix,
      colors: YAML_THEME,
    });
  } else if (
    typeof properties === 'boolean' ||
    typeof properties === 'number' ||
    typeof properties === 'string'
  ) {
    const colorize = YAML_THEME[typeof properties] as ChalkInstance;

    return prefix + PADDING + colorize(properties.toString());
  }

  return null;
}

/**
 * render a source frame
 * @param block a location block
 * @param options options for rendering
 * @param options.indent indent for each line
 * @returns a rendered string to print
 */
function renderSource(
  block: StackLocationBlock,
  options: {
    indent: string;
  },
): string {
  const { path, line } = block;
  const { indent } = options;

  const normalizedPath = path.replace(/^file:\/\//, '');

  // no source frame if the source is missing
  if (!existsSync(normalizedPath)) {
    return '';
  }

  const content = readFileSync(normalizedPath).toString();
  const highlighted = highlight(content, CODE_THEME);
  const lines = highlighted.split(/[\r\n]/);
  const base = Math.max(line - SPREAD - 1, 0);
  const displayLines = lines.slice(base, line + SPREAD);
  const lineNumberWidth = (line + SPREAD).toString().length;

  const sourceFrame = displayLines
    .map((source, index) => {
      const currentLine = base + index + 1;
      const formattedLine = currentLine.toString().padStart(lineNumberWidth);
      const isTarget = currentLine === line;
      const prefix = isTarget ? '>' : ' ';
      const gutter = ` ${prefix} ${formattedLine} `;

      return `${indent}${isTarget ? chalk.bgRed(gutter) : gutter}| ${source}`;
    })
    .join('\n');

  return '\n' + sourceFrame + '\n';
}

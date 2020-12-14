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

import { disassembleStack } from './stack';

import type { StackDescriptionBlock, StackLocationBlock } from './stack';

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
 * @returns a rendered string to print
 */
function renderLocation(block: StackLocationBlock): string {
  const { entry, path, line, column } = block;

  const location = `${path}:${line}:${column}`;

  return `    at ${chalk.grey.bold(entry)} (${chalk.grey.underline(location)})`;
}

/**
 * render a highly readable error stack
 * @param error the error to be rendered
 * @returns a rendered string to print
 */
export function renderStack(error: Error): string {
  const blocks = disassembleStack(error.stack!);

  return blocks
    .map((block) =>
      block.type === 'location'
        ? renderLocation(block)
        : renderDescription(block),
    )
    .join('\n');
}

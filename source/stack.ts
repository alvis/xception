/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   A stack parser
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

export interface StackDescriptionBlock {
  type: 'description';
  name: string;
  message: string;
}

export interface StackLocationBlock {
  type: 'location';
  entry: string;
  path: string;
  line: number;
  column: number;
}

export type StackBlock = StackDescriptionBlock | StackLocationBlock;

const stackLineExpression = /(\s*at (.+) \((.+):([0-9]+):([0-9]+)\))|(^(\w+):\s*([\w\W]*?)(\s*\n\s+))/gm;

/**
 * parse a stack into its components
 * @param stack stack content
 * @returns a list of error and stack information
 */
export function disassembleStack(stack: string): StackBlock[] {
  const matches = [...stack.matchAll(stackLineExpression)];

  return matches.map(([, , entry, path, line, column, , name, message]) => {
    if (entry && path && line && column) {
      return {
        type: 'location',
        entry,
        path,
        line: parseInt(line),
        column: parseInt(column),
      } as StackLocationBlock;
    } else {
      return {
        type: 'description',
        name,
        message,
      } as StackDescriptionBlock;
    }
  });
}

/**
 * reassemble stack components
 * @param stacks stack information
 * @returns the reassembled stack
 */
export function assembleStack(stacks: StackBlock[]): string {
  return stacks
    .map((stack) => {
      if (stack.type === 'location') {
        return `    at ${stack.entry} (${stack.path}:${stack.line}:${stack.column})`;
      } else {
        return `${stack.name}: ${stack.message}`;
      }
    })
    .join('\n');
}

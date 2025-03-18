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

const LOCATION_START = 6;
const DESCRIPTION_START = 10;
const stackLineExpression =
  /(\s*at (.+) \((.+):([0-9]+):([0-9]+)\))|(\s*at (.+):([0-9]+):([0-9]+))|(^(\w+):\s*([\w\W]*?)(\s*\n\s+))/gm;

/**
 * parse a stack into its components
 * @param stack stack content
 * @returns a list of error and stack information
 */
export function disassembleStack(stack: string): StackBlock[] {
  const matches = [...stack.matchAll(stackLineExpression)];

  return matches.map((parts) => {
    const [, entry1, path1, line1, column1] = parts.slice(1, LOCATION_START);
    const [, path2, line2, column2] = parts.slice(
      LOCATION_START,
      DESCRIPTION_START,
    );
    const [, name, message] = parts.slice(DESCRIPTION_START);

    if (entry1 && path1 && line1 && column1) {
      return {
        type: 'location',
        entry: entry1,
        path: path1,
        line: parseInt(line1),
        column: parseInt(column1),
      } as StackLocationBlock;
    } else if (path2 && line2 && column2) {
      return {
        type: 'location',
        entry: '',
        path: path2,
        line: parseInt(line2),
        column: parseInt(column2),
      } as StackLocationBlock;
    } else {
      return { type: 'description', name, message } as StackDescriptionBlock;
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
        return stack.entry
          ? `    at ${stack.entry} (${stack.path}:${stack.line}:${stack.column})`
          : `    at ${stack.path}:${stack.line}:${stack.column}`;
      } else {
        return `${stack.name}: ${stack.message}`;
      }
    })
    .join('\n');
}

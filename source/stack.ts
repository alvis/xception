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
  location: string;
  line: number;
  column: number;
}

export type StackBlock = StackDescriptionBlock | StackLocationBlock;

const locationWithEntryRegex1 = /^\s*at (\w+) \((.+):(\d+):(\d+)\)$/; // mostly node
const locationWithEntryRegex2 = /^\s*(\w+)@(.+):(\d+):(\d+)$/; // mostly web
const locationWithoutEntryRegex = /^\s*at (.+):(\d+):(\d+)$/; // mostly node
const descriptionRegex = /^(\w+):\s*(\w*)$/;

/**
 * parse a stack into its components
 * @param stack stack content
 * @returns a list of error and stack information
 */
export function disassembleStack(stack: string): StackBlock[] {
  const lines = stack.split('\n');

  return lines
    .map((line) => {
      const locationWithEntryMatch =
        locationWithEntryRegex1.exec(line) ??
        locationWithEntryRegex2.exec(line);
      if (locationWithEntryMatch) {
        const [, entry, location, line, column] = locationWithEntryMatch;

        return {
          type: 'location',
          entry,
          location,
          line: parseInt(line),
          column: parseInt(column),
        } as StackLocationBlock;
      }

      const locationWithoutEntryMatch = line.match(locationWithoutEntryRegex);
      if (locationWithoutEntryMatch) {
        const [, location, line, column] = locationWithoutEntryMatch;

        return {
          type: 'location',
          entry: '',
          location,
          line: parseInt(line),
          column: parseInt(column),
        } as StackLocationBlock;
      }

      const descriptionMatch = descriptionRegex.exec(line);
      if (descriptionMatch) {
        const [, name, message] = descriptionMatch;

        return { type: 'description', name, message } as StackDescriptionBlock;
      }

      return null;
    })
    .filter((block): block is StackBlock => block !== null);
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
          ? `    at ${stack.entry} (${stack.location}:${stack.line}:${stack.column})`
          : `    at ${stack.location}:${stack.line}:${stack.column}`;
      } else {
        return `${stack.name}: ${stack.message}`;
      }
    })
    .join('\n');
}

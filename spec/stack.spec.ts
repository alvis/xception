/*
 *                            *** MIT LICENSE ***
 * -------------------------------------------------------------------------
 * This code may be modified and distributed under the MIT license.
 * See the LICENSE file for details.
 * -------------------------------------------------------------------------
 *
 * @summary   Tests on stack related helpers
 *
 * @author    Alvis HT Tang <alvis@hilbert.space>
 * @license   MIT
 * @copyright Copyright (c) 2020 - All Rights Reserved.
 * -------------------------------------------------------------------------
 */

import { describe, expect, it } from 'vitest';

import { assembleStack, disassembleStack } from '#stack';

import type { StackBlock } from '#stack';

const stack =
  'Error0: message0\n' +
  '    at /src0:0:0\n' +
  '    at file:///src1:1:1\n' +
  'Error1: message1\n' +
  '    at entry1 (src1:1:0)\n' +
  '    at entry2 (src2:2:0)\n' +
  'Error2: message2\n' +
  '    at entry3 (src3:3:0)\n' +
  '    at entry4 (src4:4:0)';

const components: StackBlock[] = [
  {
    type: 'description',
    name: 'Error0',
    message: 'message0',
  },
  {
    type: 'location',
    entry: '',
    location: '/src0',
    line: 0,
    column: 0,
  },
  {
    type: 'location',
    entry: '',
    location: 'file:///src1',
    line: 1,
    column: 1,
  },
  {
    type: 'description',
    name: 'Error1',
    message: 'message1',
  },
  {
    type: 'location',
    entry: 'entry1',
    location: 'src1',
    line: 1,
    column: 0,
  },
  {
    type: 'location',
    entry: 'entry2',
    location: 'src2',
    line: 2,
    column: 0,
  },
  {
    type: 'description',
    name: 'Error2',
    message: 'message2',
  },
  {
    type: 'location',
    entry: 'entry3',
    location: 'src3',
    line: 3,
    column: 0,
  },
  {
    type: 'location',
    entry: 'entry4',
    location: 'src4',
    line: 4,
    column: 0,
  },
];

describe('fn:assembleStack', () => {
  it('should reassemble a stack content', () => {
    const expected = stack;

    const result = assembleStack(components);

    expect(result).toEqual(expected);
  });
});

describe('fn:disassembleStack', () => {
  it('should disassemble a stack content', () => {
    const expected = components;

    const result = disassembleStack(stack);

    expect(result).toEqual(expected);
  });

  it('should disassemble a stack content with unknown lines ignored', () => {
    const expected = components;

    const result = disassembleStack(stack + `\nunrecognized line`);

    expect(result).toEqual(expected);
  });
});

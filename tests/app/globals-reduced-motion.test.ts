/**
 * Reduced-motion regression tests for globals.css (#314).
 *
 * `html { scroll-behavior: smooth }` overrides the user's
 * `prefers-reduced-motion: reduce` setting, so in-page navigation keeps
 * animating for people who explicitly asked the OS to disable motion.
 * A media query must opt back out with `scroll-behavior: auto`.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..', '..');
const css = readFileSync(path.join(root, 'src', 'app', 'globals.css'), 'utf8');

/** Extract the body of every `@media (prefers-reduced-motion: reduce)` block. */
function reducedMotionBlocks(source: string): string[] {
  const blocks: string[] = [];
  const re = /@media\s*\(prefers-reduced-motion\s*:\s*reduce\)\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    // Walk braces to find the matching close for this at-rule.
    let depth = 1;
    let i = re.lastIndex;
    const start = i;
    while (i < source.length && depth > 0) {
      const char = source[i];
      if (char === '{') depth++;
      else if (char === '}') depth--;
      i++;
    }
    blocks.push(source.slice(start, i - 1));
    re.lastIndex = i;
  }
  return blocks;
}

/** Strip comments so commented-out CSS never satisfies an assertion. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('globals.css reduced motion (#314)', () => {
  const cssWithoutComments = stripComments(css);
  const blocks = reducedMotionBlocks(cssWithoutComments);

  it('declares a prefers-reduced-motion: reduce media query', () => {
    expect(blocks.length).toBeGreaterThan(0);
  });

  it('disables smooth scrolling inside the reduced-motion block', () => {
    const disablesSmoothScroll = blocks.some((block) =>
      /html\s*\{[^}]*scroll-behavior\s*:\s*auto\s*;/.test(block),
    );
    expect(disablesSmoothScroll).toBe(true);
  });

  it('keeps smooth scrolling as the default for everyone else', () => {
    expect(cssWithoutComments).toMatch(/html\s*\{[^}]*scroll-behavior\s*:\s*smooth\s*;/);
  });
});
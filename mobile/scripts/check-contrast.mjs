import { darkPalette, lightPalette } from '../src/palette.ts';

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum]: 4.5 for text, 3 for graphics and large text.
const pairs = [
  ['ink', 'background', 4.5], ['body', 'background', 4.5], ['body', 'surface', 4.5],
  ['muted', 'background', 4.5], ['muted', 'surface', 4.5], ['muted', 'greenSurface', 4.5],
  ['quiet', 'surface', 4.5], ['greenText', 'background', 4.5], ['greenText', 'surface', 4.5],
  ['greenText', 'greenSurface', 4.5], ['warningInk', 'warningSurface', 4.5],
  ['onLime', 'lime', 4.5], ['onLime', 'limePressed', 4.5], ['lime', 'forest', 3],
  ['onForest', 'forest', 4.5], ['onForestMuted', 'forest', 4.5], ['onForestAccent', 'forest', 4.5],
  ['onHero', 'hero', 4.5], ['heroMuted', 'hero', 4.5], ['heroAccent', 'hero', 3],
  ['calmText', 'calmBg', 4.5], ['warmText', 'warmBg', 4.5], ['hotText', 'hotBg', 4.5],
  ['calmFill', 'surface', 3], ['warmFill', 'surface', 3], ['hotFill', 'surface', 3],
  ['chart', 'surface', 3],
];

let failed = 0;
for (const [name, palette] of [['light', lightPalette], ['dark', darkPalette]]) {
  console.log(`-- ${name}`);
  for (const [fg, bg, min] of pairs) {
    const value = ratio(palette[fg], palette[bg]);
    const ok = value >= min;
    if (!ok) failed += 1;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${fg} on ${bg}: ${value.toFixed(2)} (needs ${min})`);
  }
}
if (failed) {
  console.error(`${failed} pair(s) below the minimum`);
  process.exit(1);
}

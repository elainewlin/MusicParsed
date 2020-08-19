/**
 * @file Everything related to pretty combinations of notes
 */

import { pitchToFifths, pitchRegex, transposePitch } from "./pitch";

// allow brackets in chord lines
const leftBracket = /(?:\[)?/g;
const rightBracket = /(?:\])?/g;

// matches minor chords like Amadd9, but not Cmaj7
const minorChord = "m?(?!aj)";

// matches everything that does not follow a /
const simpleChordRegex = new RegExp(
  `^(?!/)${pitchRegex.source}${minorChord}`,
  "g"
);

const fancyChordEnd = "(_[0-9]+)?";
const chordQuality =
  "(?:maj|m|aug|dim)?[0-9]*(?:(?:add|sus|no|bb|𝄫|b|♭|#|♯|x|𝄪)[0-9]+)*";
const bassNote = `(?:(/${pitchRegex.source}?|/))?`;
const chordType = `${chordQuality}${bassNote}`;
// We use this when we override chord fingerings for ~fancy~ chords
const chord = `${pitchRegex.source}${chordType}${fancyChordEnd}`;
const chordRegex = new RegExp(chord, "g");
const anchoredChordRegex = new RegExp(
  `^${leftBracket.source}${chordRegex.source}${rightBracket.source}$`
);
export const isChord = (word: string): boolean => anchoredChordRegex.test(word);

export const transposeChord = function(chord: string, amount: number): string {
  return chord.replace(pitchRegex, pitch => transposePitch(pitch, amount));
};

const stripBrackets = (str: string): string => {
  return str.replace(leftBracket, "").replace(rightBracket, "");
};

/**
 * Make complicated chords easier for beginners
 * e.g. Am7 -> Am, Dsus4 -> D
 */
export const simplifyChord = (chord: string): string => {
  const match = stripBrackets(chord).match(simpleChordRegex);
  if (match === null) {
    return chord;
  }
  return match[0];
};

const guessKeyCenterFifths = (allChords: string[]): number => {
  const allFifths = allChords.flatMap(chord => {
    const chordTypes = "(m\b|madd|msus|dim)?";
    const chordRegex = new RegExp(`^(${pitchRegex.source})${chordTypes}`);
    const m = chord.match(chordRegex);
    return m ? [pitchToFifths.get(m[1])! - (m[2] ? 3 : 0)] : [];
  });
  return Math.round(allFifths.reduce((a, b) => a + b) / allFifths.length);
};

export const transposeAmountToFifths = (
  allChords: string[],
  transpose: number
): number => {
  const center = guessKeyCenterFifths(allChords);
  // Transpose the average chord no flatter than Ab or Fm and no sharper than C# or A#m.
  return ((transpose * 7 + center + 12004) % 12) - center - 4;
};

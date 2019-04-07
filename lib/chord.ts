/**
 * @file Everything related to pretty combinations of notes
 */

import { pitchRegex, transposePitch } from "./pitch";

// matches minor chords like Amadd9, but not Cmaj7
const minorChord = "m?(?!aj)";

// matches everything that does not follow a /
const simpleChordRegex = new RegExp(
  `^(?!/)${pitchRegex.source}${minorChord}`,
  "g"
);

const fancyChordEnd = "(_[0-9]+)?";
const chordType = `(?:maj|m|aug|dim)?[0-9]*(?:(?:add|sus|no|bb|𝄫|b|♭|#|♯|x|𝄪)[0-9]+)*(?:/${
  pitchRegex.source
})?`;
// We use this when we override chord fingerings for ~fancy~ chords
const chord = `${pitchRegex.source}${chordType}${fancyChordEnd}`;
export const chordRegex = new RegExp(chord, "g");
const anchoredChordRegex = new RegExp(`^${chordRegex.source}$`);

export const isChord = (word: string): boolean => anchoredChordRegex.test(word);

export const transposeChord = function(chord: string, amount: number): string {
  return chord.replace(pitchRegex, pitch => transposePitch(pitch, amount));
};

// Make complicated chords easier for beginners
// i.e. Am7 -> Am, Dsus4 -> D
export const simplifyChord = (chord: string): string =>
  chord.match(simpleChordRegex)![0];

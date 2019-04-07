import "core-js/fn/array/flat-map";

const accidentalFifths: [string, number][] = [["bb", -14], ["𝄫", -14], ["b", -7], ["♭", -7], ["", 0], ["#", 7], ["♯", 7], ["x", 14], ["𝄪", 14]];
const letterFifths: [string, number][] = [["F", -1], ["C", 0], ["G", 1], ["D", 2], ["A", 3], ["E", 4], ["B", 5]];
const pitchFifths: [string, number][] = accidentalFifths.flatMap(function(af) {
  return letterFifths.map(function(lf): [string, number] {
    return [lf[0] + af[0], lf[1] + af[1]];
  });
});

export const pitchToFifths: Map<string, number> = new Map(pitchFifths);
export const fifthsToPitch: Map<number, string> = new Map(pitchFifths.map(function(pf): [number, string] { return [pf[1], pf[0]]; }));

export const noteString = "[A-G](?:bb|𝄫|b|♭|#|♯|x|𝄪)?";

// matches minor chords like Amadd9, but not Cmaj7
const minorChord = "m?(?!aj)";

// matches everything that does not follow a /
const simpleChordRegex = new RegExp(`^(?!/)${noteString}${minorChord}`, "g");

const replaceAt = function(str: string, index: number, replacement: string): string {
  return str.substr(0, index) + replacement + str.substr(index + replacement.length);
};

const constructChord = function(totalLength: number, chords: string[], offsets: number[]): string {
  let blankChord = Array(totalLength).join(" ");
  for(let i = 0; i < offsets.length; i++) {
    blankChord = replaceAt(blankChord, offsets[i], chords[i]);
  }
  return blankChord;
};

// Make complicated chords easier for beginners
// i.e. Am7 -> Am, Dsus4 -> D
export const simplifyChord = function(chord: string): string {
  const chords: string[] = [];
  const offsets: number[] = [];

  const chordBoundary = /\S+/g;
  chord.replace(chordBoundary, function(originalChord, offset) {
    const simpleChord = originalChord.match(simpleChordRegex)![0];
    chords.push(simpleChord);
    offsets.push(offset);
    return "";
  });

  return constructChord(chord.length, chords, offsets);
};
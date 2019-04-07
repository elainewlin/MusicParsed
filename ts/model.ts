import "core-js/fn/array/flat-map";

import { pitchToFifths, fifthsToPitch, noteRegex } from "../lib/pitch";

// matches minor chords like Amadd9, but not Cmaj7
const minorChord = "m?(?!aj)";

// matches everything that does not follow a /
const simpleChordRegex = new RegExp(
  `^(?!/)${noteRegex.source}${minorChord}`,
  "g"
);

const replaceAt = function(
  str: string,
  index: number,
  replacement: string
): string {
  return (
    str.substr(0, index) + replacement + str.substr(index + replacement.length)
  );
};

const constructChord = function(
  totalLength: number,
  chords: string[],
  offsets: number[]
): string {
  let blankChord = Array(totalLength).join(" ");
  for (let i = 0; i < offsets.length; i++) {
    blankChord = replaceAt(blankChord, offsets[i], chords[i]);
  }
  return blankChord;
};

// Make complicated chords easier for beginners
// i.e. Am7 -> Am, Dsus4 -> D
const simplifyChord = function(chord: string): string {
  const chords: string[] = [];
  const offsets: number[] = [];

  const chordBoundary = new RegExp(/\S+/, "g");
  chord.replace(chordBoundary, (originalChord, offset) => {
    const simpleChord = originalChord.match(simpleChordRegex)![0];
    chords.push(simpleChord);
    offsets.push(offset);
    return "";
  });

  return constructChord(chord.length, chords, offsets);
};

export type SongLine = { label: string } | { chord: string; lyrics: string };

export interface SongData {
  id?: string;
  fullName: string;
  artist?: string;
  title?: string;
  capo?: string;
  allChords: string[];
  overrideAllChords?: string[];
  lines: SongLine[];
}

interface SongView {
  getInstrument(): string;
  setInstrument(newInstrument: string): void;
  getOrientation(): string;
  setOrientation(newOrientation: string): void;
  getChordOption(): string;
  setChordOption(newPreference: string): void;
  getChords(): string[];
  getCapo(): number;
  setCapo(newCapo: string): void;
  getFullSongName(): string;
  setSong(data: SongData): void;
  getId(): string;
  setId(newId: string): void;
  getTranspose(): number;
  setTranspose(newTranspose: number): void;
  getData(): { allChords: string[]; lines: SongLine[]; instrument: string };
}

export const songView: SongView = new ((function SongView(this: SongView) {
  let currentInstrument = localStorage.getItem("instrument") || "none";

  this.getInstrument = function() {
    return currentInstrument;
  };

  this.setInstrument = function(newInstrument) {
    localStorage.setItem("instrument", newInstrument);
    currentInstrument = newInstrument;
  };

  let orientation = localStorage.getItem("orientation") || "right";

  this.getOrientation = function() {
    return orientation;
  };

  this.setOrientation = function(newOrientation) {
    localStorage.setItem("orientation", newOrientation);
    orientation = newOrientation;
  };

  // chordOption = original | simple
  let chordOption = localStorage.getItem("chordOption") || "original";

  this.getChordOption = function() {
    return chordOption;
  };

  this.setChordOption = function(newPreference) {
    localStorage.setItem("chordOption", newPreference);
    chordOption = newPreference;
  };

  let lines: SongLine[] = [];
  let allChords: string[] = [];
  let overrideAllChords: string[] | undefined = [];
  let fullSongName = "";

  this.getChords = function() {
    return allChords;
  };

  let capo = 0;

  this.getCapo = function() {
    return capo;
  };

  const setCapo = function(newCapo?: string): void {
    if (newCapo) {
      capo = parseInt(newCapo);
    } else {
      capo = 0;
    }
  };

  const transposeChord = function(chord: string, amount: number): string {
    const shouldSimplify = chordOption === "simple";
    let chordToTranspose = chord;
    if (shouldSimplify) {
      chordToTranspose = simplifyChord(chord);
    }
    return chordToTranspose.replace(
      noteRegex,
      pitch => fifthsToPitch.get(pitchToFifths.get(pitch)! + amount)!
    );
  };

  this.getFullSongName = function() {
    return fullSongName;
  };

  this.setSong = function(data) {
    allChords = data["allChords"];
    overrideAllChords = data["overrideAllChords"];
    let count = 0;
    lines = data["lines"].map(line =>
      "lyrics" in line ? Object.assign({ count: count++ }, line) : line
    );

    setCapo(data["capo"]);

    fullSongName = data["fullName"];
  };

  let songId: string;

  this.getId = function() {
    return songId;
  };

  this.setId = function(newId) {
    songId = newId;
  };

  let transpose = +(localStorage.getItem("transpose") || 0); // # of steps transposed, range -6 to 6

  this.getTranspose = function() {
    return transpose;
  };

  this.setTranspose = function(newTranspose) {
    transpose = newTranspose;
    localStorage.setItem("transpose", transpose.toString());
  };

  this.getData = function() {
    const allFifths = allChords.flatMap(chord => {
      const chordTypes = "(m\b|madd|msus|dim)?";
      const chordRegex = new RegExp(`^(${noteRegex.source})${chordTypes}`);
      const m = chord.match(chordRegex);
      return m ? [pitchToFifths.get(m[1])! - (m[2] ? 3 : 0)] : [];
    });
    const center = Math.round(
      allFifths.reduce((a, b) => a + b) / allFifths.length
    );
    // Transpose the average chord no flatter than Ab or Fm and no sharper than C# or A#m.
    const amount = ((transpose * 7 + center + 12004) % 12) - center - 4;

    const transposedAllChords = allChords
      .slice()
      .map(chord => transposeChord(chord, amount));
    let dataAllChords = Array.from(new Set(transposedAllChords));
    if (overrideAllChords && transpose == 0) {
      dataAllChords = overrideAllChords;
    }

    const dataLines = lines.slice().map(line => {
      const newLine = { ...line };
      if ("chord" in newLine) {
        newLine["chord"] = transposeChord(newLine["chord"], amount);
      }
      return newLine;
    });

    return {
      allChords: dataAllChords,
      lines: dataLines,
      instrument: currentInstrument,
    };
  };
} as unknown) as { new (): SongView })();

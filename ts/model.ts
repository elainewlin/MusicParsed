import "core-js/fn/array/flat-map";
import $ from "jquery";

var accidentalFifths: [string, number][] = [["bb", -14], ["𝄫", -14], ["b", -7], ["♭", -7], ["", 0], ["#", 7], ["♯", 7], ["x", 14], ["𝄪", 14]];
var letterFifths: [string, number][] = [["F", -1], ["C", 0], ["G", 1], ["D", 2], ["A", 3], ["E", 4], ["B", 5]];
var pitchFifths: [string, number][] = accidentalFifths.flatMap(function(af) {
  return letterFifths.map(function(lf): [string, number] {
    return [lf[0] + af[0], lf[1] + af[1]];
  });
});

export var pitchToFifths: Map<string, number> = new Map(pitchFifths);
var fifthsToPitch: Map<number, string> = new Map(pitchFifths.map(function(pf): [number, string] { return [pf[1], pf[0]]; }));

const noteString = "[A-G](?:bb|𝄫|b|♭|#|♯|x|𝄪)?";
const noteRegex = new RegExp(noteString, "g");

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
const simplifyChord = function(chord: string): string {
  const chords: string[] = [];
  const offsets: number[] = [];

  const chordBoundary = new RegExp(/\S+/, "g");
  chord.replace(chordBoundary, function(originalChord, offset) {
    const simpleChord = originalChord.match(simpleChordRegex)![0];
    chords.push(simpleChord);
    offsets.push(offset);
    return "";
  });

  return constructChord(chord.length, chords, offsets);
};

export type SongLine = {label: string} | {chord: string; lyrics: string};

export interface SongData {
  id: string;
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

export var songView: SongView = new (function SongView(this: SongView) {
  var currentInstrument = localStorage.getItem("instrument") || "none";

  this.getInstrument = function() {
    return currentInstrument;
  };

  this.setInstrument = function(newInstrument) {
    localStorage.setItem("instrument", newInstrument);
    currentInstrument = newInstrument;
  };

  var orientation = localStorage.getItem("orientation") || "right";

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

  var lines: SongLine[] = [];
  var allChords: string[] = [];
  var overrideAllChords: string[] | undefined = [];
  var fullSongName = "";

  this.getChords = function() {
    return allChords;
  };

  var capo = 0;

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
    return chordToTranspose.replace(noteRegex, function(pitch) {
      return fifthsToPitch.get(pitchToFifths.get(pitch)! + amount)!;
    });
  };


  this.getFullSongName = function() {
    return fullSongName;
  };

  this.setSong = function(data) {
    allChords = data["allChords"];
    overrideAllChords = data["overrideAllChords"];
    let count = 0;
    lines = data["lines"].map(line => "lyrics" in line ? Object.assign({ count: count++ }, line) : line);

    setCapo(data["capo"]);

    fullSongName = data["id"];
  };


  var songId: string;

  this.getId = function() {
    return songId;
  };

  this.setId = function(newId) {
    songId = newId;
  };

  var transpose = +(localStorage.getItem("transpose") || 0); // # of steps transposed, range -6 to 6

  this.getTranspose = function() {
    return transpose;
  };

  this.setTranspose = function(newTranspose) {
    transpose = newTranspose;
    localStorage.setItem("transpose", transpose.toString());
  };

  this.getData = function() {
    var allFifths = allChords.flatMap(function(chord) {
      const chordTypes = "(m\b|madd|msus|dim)?";
      const chordRegex = new RegExp(`^(${noteString})${chordTypes}`);
      var m = chord.match(chordRegex);
      return m ? [pitchToFifths.get(m[1])! - (m[2] ? 3 : 0)] : [];
    });
    var center = Math.round(allFifths.reduce(function(a, b) { return a + b; }) / allFifths.length);
    // Transpose the average chord no flatter than Ab or Fm and no sharper than C# or A#m.
    var amount = (transpose * 7 + center + 12004) % 12 - center - 4;

    const transposedAllChords = allChords.slice().map(function(chord) {
      return transposeChord(chord, amount);
    });
    let dataAllChords = Array.from(new Set(transposedAllChords));
    if(overrideAllChords && transpose == 0) {
      dataAllChords = overrideAllChords;
    }

    const dataLines = lines.slice().map(function(line) {
      var newLine = $.extend({}, line);
      if ("chord" in newLine) {
        newLine["chord"] = transposeChord(newLine["chord"], amount);
      }
      return newLine;
    });

    return { allChords: dataAllChords, lines: dataLines, instrument: currentInstrument };
  };
} as unknown as { new(): SongView });

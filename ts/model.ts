import "core-js/fn/array/flat-map";
import {noteString, pitchToFifths, fifthsToPitch, simplifyChord} from "./chordHelpers";
import {SongLine} from "./songParser";

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
    return chordToTranspose.replace(new RegExp(noteString, "g"), function(pitch) {
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

    fullSongName = data["fullName"];
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
      var newLine = {...line};
      if ("chord" in newLine) {
        newLine["chord"] = transposeChord(newLine["chord"], amount);
      }
      return newLine;
    });

    return { allChords: dataAllChords, lines: dataLines, instrument: currentInstrument };
  };
} as unknown as { new(): SongView });

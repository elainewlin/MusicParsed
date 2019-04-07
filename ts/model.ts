import "core-js/fn/array/flat-map";

import { pitchToFifths, pitchRegex } from "../lib/pitch";
import { simplifyChord, transposeChord } from "../lib/chord";

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
      const chordRegex = new RegExp(`^(${pitchRegex.source})${chordTypes}`);
      const m = chord.match(chordRegex);
      return m ? [pitchToFifths.get(m[1])! - (m[2] ? 3 : 0)] : [];
    });
    const center = Math.round(
      allFifths.reduce((a, b) => a + b) / allFifths.length
    );
    // Transpose the average chord no flatter than Ab or Fm and no sharper than C# or A#m.
    const amount = ((transpose * 7 + center + 12004) % 12) - center - 4;

    let processChord = (chord: string): string => transposeChord(chord, amount);
    const shouldSimplify = chordOption === "simple";
    if (shouldSimplify) {
      processChord = (chord: string) =>
        transposeChord(simplifyChord(chord), amount);
    }

    const transposedAllChords = allChords.slice().map(processChord);
    let dataAllChords = Array.from(new Set(transposedAllChords));
    if (overrideAllChords && transpose == 0) {
      dataAllChords = overrideAllChords;
    }

    const dataLines = lines.slice().map(line => {
      const newLine = { ...line };
      if ("chord" in newLine) {
        newLine["chord"] = newLine["chord"].replace(/\S+/g, processChord);
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

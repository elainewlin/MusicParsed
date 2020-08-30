/**
 * @file Everything related to chord fingering diagrams.
 */

import "core-js/fn/array/flat-map";
import { pitchToSemitones, pitchRegex } from "../lib/pitch";
import { InstrumentData, instrumentsData } from "../lib/instrument";

/**
 * Support for left-handed chord diagrams
 * @param  {string} e.g. 2000
 * @return {string} e.g. 0002
 */
export const reverseString = function(str: string): string {
  return str
    .split("")
    .reverse()
    .join("");
};

type ChordFingeringData =
  | {
      viewLeft: number;
      viewWidth: number;
      width: number;
      chordName: string;
      offset?: number;
      openY: number;
      dots: { x: number; y: number }[];
      open: number[];
      mute: number[];
    }
  | {
      chordName: string;
      unknown: true;
    };

/**
 * Get data on how to render a chord SVG
 * @param  {string} chordName e.g. Bm
 * @param  {string} chordFingeringStr e.g. 4,2,2,2
 * @param  {InstrumentData} instrumentData
 * @return {ChordFingeringData}
 */
export const getChordFingering = function(
  chordName: string,
  chordFingeringStr: string,
  instrumentData: InstrumentData
): ChordFingeringData {
  const chordFingering = chordFingeringStr.split(",");
  const offset = chordFingering.every(
    y => !(+y > 0) || +y <= instrumentData.frets
  )
    ? 1
    : Math.min.apply(null, chordFingering.flatMap(y => (+y > 0 ? [+y] : [])));
  const left = offset == 1 ? 0 : 0.5 * ("" + offset).length;
  return {
    viewLeft: -0.5 - left,
    viewWidth: instrumentData.strings + left,
    width: (instrumentData.strings + left) * 11,
    chordName: chordName,
    offset: offset == 1 ? undefined : offset,
    openY: offset == 1 ? -0.5 : 0,
    dots: chordFingering.flatMap((y, x) =>
      +y > 0 ? [{ x: x, y: +y - offset + 1 }] : []
    ),
    open: chordFingering.flatMap((y, x) => (+y == 0 ? [x] : [])),
    mute: chordFingering.flatMap((y, x) => (y == "x" ? [x] : [])),
  };
};

/**
 * Get data on how to render any chord
 * @param  {string} chord
 * @param  {InstrumentData} instrumentData
 * @param  {string} orientation
 * @return {ChordFingeringData}
 */
export const getChordData = function(
  chord: string,
  instrumentData: InstrumentData,
  orientation: string = "right"
): ChordFingeringData {
  let chordName = chord;
  const unknown: ChordFingeringData = {
    chordName: chordName,
    unknown: true,
  };

  const match = chord.match(new RegExp(`^(${pitchRegex.source})(.*)$`))!;
  if (!match) {
    return unknown;
  }
  const [fullChord, root, chordType] = match;

  let chordFingering = instrumentData.chords[pitchToSemitones(root)].get(
    chordType
  );

  const overrideDefaultChord = chord.includes("|");
  if (overrideDefaultChord) {
    const chordComponents = chord.split("|");
    [chordName, chordFingering] = chordComponents;
  }

  if (chordFingering) {
    if (orientation === "left") {
      chordFingering = reverseString(chordFingering);
    }
    return getChordFingering(chordName, chordFingering, instrumentData);
  } else {
    return unknown;
  }
};

interface ChordsData {
  strings: number;
  stringsMinus1: number;
  frets: number;
  fretsPlusHalf: number;
  viewHeight: number;
  height: number;
  stringLines: number[];
  fretLines: number[];
  chords: ChordFingeringData[];
}

export const getAllChordData = function(
  allChords: string[],
  currentInstrument: string,
  orientation: string = "right"
): ChordsData {
  const instrumentData = instrumentsData[currentInstrument];
  return {
    strings: instrumentData.strings,
    stringsMinus1: instrumentData.strings - 1,
    frets: instrumentData.frets,
    fretsPlusHalf: instrumentData.frets + 0.5,
    viewHeight: instrumentData.frets + 1.5,
    height: (instrumentData.frets + 1.5) * 11,
    stringLines: Array.apply(null, Array(instrumentData.strings - 2)).map(
      (_, i) => i + 1
    ),
    fretLines: Array.apply(null, Array(instrumentData.frets)).map(
      (_, i) => i + 0.5
    ),
    chords: allChords.map(chord =>
      getChordData(chord, instrumentData, orientation)
    ),
  };
};

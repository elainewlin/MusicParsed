/**
 * @file Types for song representation.
 */

export interface ChordLyricPair {
  chord: string | null;
  lyric: string;
  overLyric?: true;
}

export interface ChordLyricLine {
  className: string;
  chordLyricPairs: ChordLyricPair[];
}

export type RenderedLine =
  | {
      label: string;
    }
  | ChordLyricLine;

export interface SongData {
  id?: string;
  fullName: string;
  artist?: string;
  title?: string;
  capo?: string;
  allChords: string[];
  overrideAllChords?: string[];
  lines: RenderedLine[];
}

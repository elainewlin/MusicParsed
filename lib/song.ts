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
  songId: string;
  fullName: string;
  artist: string;
  title: string;
  capo?: string;
  allChords: string[];
  overrideAllChords?: string[];
  lines: RenderedLine[];
  url?: string;
  // Used for song search
  label?: string;
  value?: string;
  tags?: string[];
}

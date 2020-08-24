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
  allChords: string[];
  lines: RenderedLine[];
  capo?: string;
  overrideAllChords?: string[];
  url?: string;
  tags?: string[];
  // Added client-side for song search
  label?: string;
  value?: string;
}

/**
 * @file Types for song representation.
 */
import { Tag } from "../models/tag";

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

// Input to parser parseLines
export interface SongInput {
  title: string;
  artist: string;
  songText: string;
}

// Output of parser parseLines
export interface SongData {
  songId: string;
  fullName: string;
  artist: string;
  title: string;
  allChords: string[];
  lines: RenderedLine[];
  capo?: string;
  overrideAllChords?: string[];
  url: string;
  tagIds?: string[];
  // Added client-side for song search
  label?: string;
  value?: string;
}

export interface AllSongsResponse {
  data: SongData[];
  included: {
    tags: Tag[];
  };
}

export interface SongResponse {
  data: SongData;
}

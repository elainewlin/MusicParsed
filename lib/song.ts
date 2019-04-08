/**
 * @file Types for song representation.
 */

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

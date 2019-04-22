/**
 * @file Everything related to converting between song and lyric
 * representations.
 */

import { isChord } from "./chord";
import { SongData, ChordLyricLine, ChordLyricPair } from "./song";

export const slugify = function(text: string): string {
  text = text.replace(/[^A-Za-z0-9 ]+/g, "").toLowerCase();
  return text.replace(/ /g, "_");
};

export const isLabel = function(line: string): boolean {
  if (!line) {
    return false;
  }
  // Checks whether a line is a label
  return (line.startsWith("[") && line.endsWith("]")) || line.endsWith(":");
};

export const isChordLine = function(line: string): boolean {
  if (!line) {
    return false;
  }

  const chordBoundary = /\S+/g;

  let isLineChord = true;

  line.replace(chordBoundary, word => {
    isLineChord = isLineChord && isChord(word);
    return "";
  });
  return isLineChord;
};

export const isLyricLine = function(line: string): boolean {
  return !isLabel(line) && !isChordLine(line);
};

export const renderChordLyricLine = function(
  chordString: string,
  lyrics: string
): ChordLyricLine {
  let className = "line";

  if (chordString.length > 0 && lyrics.length > 0) {
    className = "chordLyricLine";
  }

  /**
  Keep track of the chords + their offset positions in the string i.e.
  Dm      G
  Hello world
  has offset + chords (0, "Dm"), (8, "G")
  */
  const chordBoundary = new RegExp(/\S+/, "g");

  const offsetChordPairs: { offset: number; chord: string | null }[] = [];
  chordString.replace(chordBoundary, (chord, offset) => {
    offsetChordPairs.push({ offset, chord });
    return "";
  });
  if (offsetChordPairs.length === 0 || offsetChordPairs[0].offset !== 0) {
    offsetChordPairs.unshift({ offset: 0, chord: null });
  }
  const maxOffset = offsetChordPairs[offsetChordPairs.length - 1].offset;

  lyrics = lyrics.padEnd(maxOffset);
  offsetChordPairs.push({ offset: lyrics.length, chord: null });

  const chordLyricPairs: ChordLyricPair[] = [];

  for (let i = 0; i < offsetChordPairs.length - 1; i++) {
    const { offset: lastOffset, chord } = offsetChordPairs[i];
    const nextOffset = offsetChordPairs[i + 1].offset;
    const lyric = lyrics.slice(lastOffset, nextOffset);
    if (chord === null || /[^ ]/.test(lyric.slice(0, chord.length + 1))) {
      chordLyricPairs.push({ chord, lyric, overLyric: true });
    } else {
      chordLyricPairs.push({ chord, lyric: lyric.slice(chord.length) });
    }
  }

  return {
    className: className,
    chordLyricPairs: chordLyricPairs,
  };
};

export const parseLines = function({
  title,
  artist,
  songText,
}: {
  title: string;
  artist: string;
  songText: string;
}): SongData {
  const data: SongData = {
    title,
    artist,
    fullName: `${title} - ${artist}`,
    id: `${slugify(title)} - ${slugify(artist)}`,
    lines: [],
    allChords: [],
  };

  const updateAllChords = function(line: string): void {
    line.split(" ").map((chord: string) => {
      if (chord.includes("/")) {
        chord = chord.split("/")[0];
      }
      if (!data.allChords.includes(chord) && chord != "") {
        data.allChords.push(chord);
      }
    });
  };

  let lines = songText.split("\n");
  lines = lines.map(line => line.trimRight());

  const iterator = lines[Symbol.iterator]();

  const firstLine = lines[0];
  if (firstLine.startsWith("CAPO ")) {
    data.capo = firstLine.slice("CAPO ".length);
    iterator.next();
  } else if (firstLine.startsWith("ALL CHORDS ")) {
    data.overrideAllChords = firstLine.slice("ALL CHORDS ".length).split(";");
    iterator.next();
  }

  for (let line of iterator) {
    if (isLabel(line)) {
      data.lines.push({ label: line });
    } else if (isChordLine(line)) {
      for (;;) {
        const nextLine = iterator.next().value;
        let lyrics = "";
        if (isLyricLine(nextLine)) {
          lyrics = nextLine;
        }
        data.lines.push(renderChordLyricLine(line, lyrics));
        updateAllChords(line);

        line = nextLine;
        if (isLabel(line)) {
          data.lines.push({ label: line });
          break;
        } else if (!isChordLine(line)) {
          break;
        }
      }
    } else if (line) {
      data.lines.push(renderChordLyricLine("", line));
    }
  }
  return data;
};

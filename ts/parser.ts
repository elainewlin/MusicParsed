import { isChord } from "../lib/chord";
import { SongData } from "./model";

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
        data.lines.push({ lyrics: lyrics, chord: line });
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
      data.lines.push({ lyrics: line, chord: "" });
    }
  }

  return data;
};

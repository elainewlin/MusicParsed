import { SongData } from "./model";

const slugify = function(text: string): string {
  text = text.replace(/[^A-Za-z0-9 ]+/g, "").toLowerCase();
  return text.replace(/ /g, "_");
};

const isLabel = function(line: string): boolean {
  if (!line) {
    return false;
  }
  // Checks whether a line is a label
  return (line.startsWith("[") && line.endsWith("]")) || line.endsWith(":");
};

const isChordLine = function(line: string): boolean {
  if (!line) {
    return false;
  }

  const pitch = "[A-G](?:bb|𝄫|b|♭|#|♯|x)?";
  const fancyChordEnd = "(_[0-9]+)?$";
  const chordType = `(?:maj|m|aug|dim)?[0-9]*(?:(?:add|sus|no|bb|𝄫|b|♭|#|♯|x|𝄪)[0-9]+)*(?:/${pitch})?`;
  // We use this when we override chord fingerings for ~fancy~ chords
  const chord = `^${pitch}${chordType}${fancyChordEnd}`;
  const chordReg = new RegExp(chord, "g");
  const chordBoundary = /\S+/g;

  let isLineChord = true;

  line.replace(chordBoundary, function(word) {
    let wordIsChord = false;

    if (word.match(chordReg)) {
      wordIsChord = true;
    }

    isLineChord = isLineChord && wordIsChord;
    return "";
  });
  return isLineChord;
};

const isLyricLine = function(line: string): boolean {
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
        let nextLine = iterator.next().value;
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

export default {
  slugify,
  isLabel,
  isChordLine,
  isLyricLine
};
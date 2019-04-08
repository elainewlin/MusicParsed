const OCTAVE = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export interface Instrument {
  stringCount: number;
  notes: number[];
}

export const Ukulele = function(): Instrument {
  const that = Object.create(Ukulele.prototype);
  that.stringCount = 4;
  that.notes = [33, 28, 24, 31];
  Object.freeze(that);
  return that;
};

export const Guitar = function(): Instrument {
  const that = Object.create(Guitar.prototype);
  that.stringCount = 6;
  that.notes = [28, 23, 19, 14, 9, 4];
  Object.freeze(that);
  return that;
};

export interface Note {
  initialString: number;
  fret: number;
  time: number;
  toGuitar(): Note;
  toUkulele(): Note;
}

export const Note = function(
  initialString: number,
  fret: number,
  time: number
): Note {
  const that = Object.create(Note.prototype);
  that.initialString = initialString;
  that.fret = fret;
  that.time = time;

  that.getNote = function() {
    const value = initialString + fret;
    return OCTAVE[value % 12];
  };

  that.toUkulele = function() {
    const stringIndex = Guitar().notes.indexOf(initialString);
    const ukeStrings = Ukulele().notes;

    if (stringIndex < 4) {
      if (fret >= 5) {
        return Note(ukeStrings[stringIndex], fret - 5, time);
      } else {
        return Note(ukeStrings[stringIndex], fret + 7, time);
      }
    } else {
      if (fret <= 12) {
        return Note(ukeStrings[stringIndex % 4], fret, time);
      } else {
        return Note(ukeStrings[stringIndex % 4], fret % 12, time);
      }
    }
  };

  that.toGuitar = function() {
    const stringIndex = Ukulele().notes.indexOf(initialString);
    const guitarStrings = Guitar().notes;

    return Note(guitarStrings[stringIndex], fret + 5, time);
  };

  Object.freeze(that);
  return that;
};

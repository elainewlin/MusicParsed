import $ from "jquery";
import "bootstrap";
import "bootstrap/js/dist/button";
import "../../css/convert.css";
import { Instrument, Guitar, Ukulele, Note } from "./music";

// Gets sequence of notes from the guitar chords
const parseTab = function(instrument: Instrument): Note[][] {
  const allNotes: Note[] = [];
  const tab = ($(".tab")[0] as HTMLTextAreaElement).value.split("\n");

  for (let i = 0; i < instrument.stringCount; i++) {
    // Note for the open string
    const initialNote = instrument.notes[i];

    // All notes played on one string
    const oneString = tab[i];

    const digits = new RegExp(/\d+/, "g");
    oneString.replace(digits, (fret, time) => {
      allNotes.push(Note(initialNote, parseInt(fret), time));
      return "";
    });
  }

  const timeToNotes: { [time: number]: Note[] } = {};
  allNotes.map(note => {
    if (note.time in timeToNotes) {
      timeToNotes[note.time].push(note);
    } else {
      timeToNotes[note.time] = [note];
    }
  });

  const sequence = [];
  for (const time in timeToNotes) {
    sequence.push(timeToNotes[time]);
  }

  return sequence;
};

const printTab = function(instrument: Instrument, sequence: Note[][]): void {
  const strings = [];
  for (let i = 0; i < instrument.stringCount; i++) {
    strings.push("");
  }

  for (const time in sequence) {
    const chord = sequence[time];

    for (const i in chord) {
      const note = chord[i];
      const stringIndex = instrument.notes.indexOf(note.initialString);
      const numBlanks = note.time - strings[stringIndex].length;

      strings[stringIndex] += Array(numBlanks).join("-");
      strings[stringIndex] += note.fret.toString();
    }
  }

  const maxLength = Math.max(...strings.map(oneString => oneString.length));
  for (let i = 0; i < instrument.stringCount; i++) {
    const numBlanks = maxLength - strings[i].length;
    strings[i] += Array(numBlanks).join("-");
  }

  const newTab = strings.join("\n");
  $(".tab.converted").html(newTab);
};

const convertNote = function(note: Note, newInstrument: Instrument): Note {
  if (newInstrument instanceof Guitar) {
    return note.toGuitar();
  }
  if (newInstrument instanceof Ukulele) {
    return note.toUkulele();
  }
  throw new Error("convertNote: unknown instrument");
};

const convertTab = function(
  oldInstrument: Instrument,
  newInstrument: Instrument
): void {
  const oldSequence = parseTab(oldInstrument);

  const newSequence = [];
  for (const time in oldSequence) {
    const oldChord = oldSequence[time];
    const newChord = [];

    for (const i in oldChord) {
      const oldNote = oldChord[i];
      const newNote = convertNote(oldNote, newInstrument);
      newChord.push(newNote);
    }
    newSequence.push(newChord);
  }
  printTab(newInstrument, newSequence);
};

const ukeToGuitar = (): void => convertTab(Ukulele(), Guitar());
const guitarToUke = (): void => convertTab(Guitar(), Ukulele());

let convertFunction = guitarToUke;

const setPlaceholder = (placeholder: string): void => {
  $(".tab.input").attr("placeholder", placeholder);
};
$("#toUkulele").on("click", () => {
  $(".fromInstrument").html("guitar");
  $(".toInstrument").html("ukulele");
  const guitarTabExample =
    "E|-------2-----\n" +
    "B|-----3---3---\n" +
    "G|---2-------2-\n" +
    "D|-0-----------\n" +
    "A|-------------\n" +
    "E|-------------";
  setPlaceholder(guitarTabExample);
  convertFunction = guitarToUke;
});

$("#toGuitar").on("click", () => {
  $(".fromInstrument").html("ukulele");
  $(".toInstrument").html("guitar");
  const ukuleleTabExample =
    "A|-------2-----\n" +
    "E|-----3---3---\n" +
    "C|---2-------2-\n" +
    "G|-0-----------";
  setPlaceholder(ukuleleTabExample);
  convertFunction = ukeToGuitar;
});

$(".convert").on("click", () => {
  $(".tab.converted").html("");
  convertFunction();
});

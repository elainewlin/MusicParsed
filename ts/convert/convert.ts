import $ from "jquery";
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
    var oneString = tab[i];

    const digits = new RegExp(/\d+/, "g");
    oneString.replace(digits, function(fret, time) {
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
  for(let time in timeToNotes) {
    sequence.push(timeToNotes[time]);
  }

  return sequence;
};

var printTab = function(instrument: Instrument, sequence: Note[][]): void {
  var strings = [];
  for (var i = 0; i < instrument.stringCount; i++) {
    strings.push("");
  }

  for (let time in sequence) {
    const chord = sequence[time];

    for (let i in chord) {
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

const convertTab = function(oldInstrument: Instrument, newInstrument: Instrument): void {
  const oldSequence = parseTab(oldInstrument);

  const newSequence = [];
  for (let time in oldSequence) {
    const oldChord = oldSequence[time];
    const newChord = [];

    for (let i in oldChord) {
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

$("#toUkulele").click(function() {
  $(".fromInstrument").html("guitar");
  $(".toInstrument").html("ukulele");
  convertFunction = guitarToUke;
});

$("#toGuitar").click(function() {
  $(".fromInstrument").html("ukulele");
  $(".toInstrument").html("guitar");
  convertFunction = ukeToGuitar;
});

$(".convert").click(function() {
  $(".tab.converted").html("");
  convertFunction();
});
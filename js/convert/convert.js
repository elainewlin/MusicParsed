import "babel-polyfill";
import $ from "jquery";
import "bootstrap/js/dist/button";
import "../../css/convert.css";
import { Guitar, Ukulele, Note } from "./music.js";

// Gets sequence of notes from the guitar chords
const parseTab = function(instrument) {
  const allNotes = [];
  const tab = $(".tab")[0].value.split("\n");

  for (let i = 0; i < instrument.stringCount; i++) {
    // Note for the open string
    const initialNote = instrument.notes[i];

    // All notes played on one string
    var oneString = tab[i];

    const digits = new RegExp(/\d+/, "g");
    oneString.replace(digits, function(fret, time) {
      allNotes.push(Note(initialNote, parseInt(fret), time));
    });
  }

  const timeToNotes = {};
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

var printTab = function(instrument, sequence) {
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

const convertNote = function(note, newInstrument) {
  if (newInstrument instanceof Guitar) {
    return note.toGuitar();
  }
  if (newInstrument instanceof Ukulele) {
    return note.toUkulele();
  }
};

const convertTab = function(oldInstrument, newInstrument) {
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

const ukeToGuitar = () => convertTab(Ukulele(), Guitar());
const guitarToUke = () => convertTab(Guitar(), Ukulele());

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
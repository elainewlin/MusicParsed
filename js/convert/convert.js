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
    })
  }

  const timeToNotes = {};
  allNotes.map(note => {
    if (note.time in timeToNotes) {
      timeToNotes[note.time].push(note)
    } else {
      timeToNotes[note.time] = [note]
    }
  })

  const sequence = [];
  for(let time in timeToNotes) {
    sequence.push(timeToNotes[time]);
  }

  return sequence;
};

var printTab = function(instrument, sequence) {
  var strings = [];
  for (var i = 0; i < instrument.stringCount; i++) {
    strings.push([]);
  }

  for (var time in sequence) {
    var chord = sequence[time];

    for (let i in chord) {
      var note = chord[i];
      var stringIndex = instrument.notes.indexOf(note.initialString);
      var numBlanks = note.time - strings[stringIndex].length;

      for (let j = 0; j < numBlanks; j++) {
        strings[stringIndex].push("-");
      }

      const fret = note.fret.toString();
      for (let j = 0; j < fret.length; j++) {
        strings[stringIndex].push(fret[j]);
      }
    }
  }

  var maxLength = Math.max(...strings.map(oneString => oneString.length));

  for (let i = 0; i < instrument.stringCount; i++) {
    const numBlanks = maxLength - strings[i].length;
    for (let j = 0; j < numBlanks; j++) {
      strings[i].push("-");
    }
  }

  var newTab = "";

  strings.map(function(oneString) {
    newTab += oneString.join("") + "\n";
  });
  $(".tab.converted").html(newTab);

};

var ukeToGuitar = function() {
  var sequence = parseTab(Ukulele());
  var guitarSequence = [];
  for (var time in sequence) {
    var chord = sequence[time];
    var guitarChord = [];

    for (let i in chord) {
      const note = chord[i];
      guitarChord.push(note.toGuitar());
    }
    guitarSequence.push(guitarChord);
  }
  printTab(Guitar(), guitarSequence);
};

var guitarToUke = function() {
  var sequence = parseTab(Guitar());
  var ukeSequence = [];
  for (var time in sequence) {
    var chord = sequence[time];
    var ukeChord = [];

    for (let i in chord) {
      const note = chord[i];
      ukeChord.push(note.toUkulele());
    }
    ukeSequence.push(ukeChord);
  }
  printTab(Ukulele(), ukeSequence);
};

var convertFunction = guitarToUke;

$("#toUkulele").click(function() {
  $(".fromInstrument").html("guitar");
  $(".toInstrument").html("ukulele");
  convertFunction = guitarToUke;
});

$("#toGuitar").click(function() {
  $(".toInstrument").html("guitar");
  $(".fromInstrument").html("ukulele");
  convertFunction = ukeToGuitar;
});

$(".convert").click(function() {
  $(".tab.converted").html("");
  convertFunction();
});
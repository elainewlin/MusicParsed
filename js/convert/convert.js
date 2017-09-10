import $ from "jquery";
import {Guitar, Ukulele, Note} from "./music.js";

// Gets sequence of notes from the guitar chords
var parseTab = function(instrument) {
  var sequence = [];
  var tab = $(".tab")[0].value.split("\n");

  var allStrings = tab.map(function(oneString) {
    return oneString.split("");
  });

  for(var time = 0; time < allStrings[0].length; time++) {
    var chord = [];
    for(var i = 0; i < instrument.stringCount; i++) {
      var oneString = allStrings[i];
      var initialNote = instrument.notes[i];

      // left-align chords
      if(!Number.isInteger(parseInt(oneString[time-1]))) {
        var oneDigit = parseInt(oneString[time]);
        var twoDigit = parseInt(oneString[time]+oneString[time+1]); 

        if(Number.isInteger(oneDigit)) {
          if(Number.isInteger(twoDigit)) {
            chord.push(Note(initialNote, twoDigit, time));
          }
          else {
            chord.push(Note(initialNote, twoDigit, time));
          }
        }
      }
    }

    if(chord.length > 0) {
      sequence.push(chord);
    }
  }

  return sequence;
};

var printTab = function(instrument, sequence) {
  var strings = [];
  for(var i = 0; i < instrument.stringCount; i++) {
    strings.push([]);
  }

  for(var time in sequence) {
    var chord = sequence[time];
    var notes = "";

    for(var i in chord) {
      var note = chord[i];
      var stringIndex = instrument.notes.indexOf(note.initialString);
      var numBlanks = note.time - strings[stringIndex].length;

      for(var j = 0; j < numBlanks; j++) {
        strings[stringIndex].push('-');
      }

      var fret = note.fret.toString();
      for(var j = 0; j < fret.length; j++) {
        strings[stringIndex].push(fret[j]);
      }
    }
  }

  var maxLength = Math.max(...strings.map(oneString => oneString.length));

  for(var i = 0; i < instrument.stringCount; i++) {
    var numBlanks = maxLength - strings[i].length;
    for(var j = 0; j < numBlanks; j++) {
      strings[i].push('-');
    }
  }

  var newTab = $(".tab.converted").html();
  
  strings.map(function(oneString) {
    newTab += oneString.join("") + "\n";
  })
  $(".tab.converted").html(newTab);

};

var ukeToGuitar = function() {
  var sequence = parseTab(Ukulele());
  var transposed = [];
  var guitarSequence = [];
  for(var time in sequence) {
    var chord = sequence[time];
    var guitarChord = [];
    var notes = "";

    for(var i in chord) {
      var note = chord[i];
      notes += note.getNote();
      guitarChord.push(note.toGuitar());
    }
    guitarSequence.push(guitarChord);
  }
  printTab(Guitar(), guitarSequence);
};

var guitarToUke = function() {
  var sequence = parseTab(Guitar());
  var transposed = [];
  var ukeSequence = [];
  for(var time in sequence) {
    var chord = sequence[time];
    var ukeChord = [];
    var notes = "";

    for(var i in chord) {
      var note = chord[i];
      notes += note.getNote();
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

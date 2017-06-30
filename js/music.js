var OCTAVE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

var Ukulele = function() {
  var that = Object.create(Ukulele.prototype);
  that.stringCount = 4;
  that.notes = [33, 28, 24, 31];
  Object.freeze(that);
  return that;
}

var Guitar = function() {
  var that = Object.create(Guitar.prototype);
  that.stringCount = 6;
  that.notes = [28, 23, 19, 14, 9, 4];
  Object.freeze(that);
  return that;
}

var Note = function(initialString, fret, time) {
  var that = Object.create(Note.prototype);
  that.initialString = initialString;
  that.fret = fret;
  that.time = time;

  that.getNote = function() {
    var value = initialString+fret;
    return OCTAVE[value % 12];
  }

  that.toUkulele = function() {
    var stringIndex = Guitar().notes.indexOf(initialString);
    var ukeStrings = Ukulele().notes;

    if(stringIndex < 4) {
      if(fret >= 5) {
        return Note(ukeStrings[stringIndex], fret - 5, time);
      }
      else {
        return Note(ukeStrings[stringIndex], fret + 7, time);
      }
    }
    else {
      if(fret <= 12) {
        return Note(ukeStrings[stringIndex % 4], fret, time);
      }
      else {
        return Note(ukeStrings[stringIndex % 4], fret % 12, time);
      }
    }
  }

  that.toGuitar = function() {
    var stringIndex = Ukulele().notes.indexOf(initialString);
    var guitarStrings = Guitar().notes;

    return Note(guitarStrings[stringIndex], fret+5, time);
  }

  Object.freeze(that);
  return that;
}
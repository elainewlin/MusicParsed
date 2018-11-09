import $ from "jquery";

var accidentalFifths = [["bb", -14], ["𝄫", -14], ["b", -7], ["♭", -7], ["", 0], ["#", 7], ["♯", 7], ["x", 14], ["𝄪", 14]];
var letterFifths = [["F", -1], ["C", 0], ["G", 1], ["D", 2], ["A", 3], ["E", 4], ["B", 5]];
var pitchFifths = [].concat.apply([], accidentalFifths.map(function(af) {
  return letterFifths.map(function(lf) {
    return [lf[0] + af[0], lf[1] + af[1]];
  });
}));

export var pitchToFifths = new Map(pitchFifths);
var fifthsToPitch = new Map(pitchFifths.map(function(pf) { return [pf[1], pf[0]]; }));

const noteString = "[A-G](?:bb|𝄫|b|♭|#|♯|x|𝄪)?";
const noteRegex = new RegExp(noteString, "g");

// matches minor chords like Amadd9, but not Cmaj7
const minorChord = "m?(?!aj)";

// matches everything that does not follow a /
const simpleChordRegex = new RegExp(`^(?!/)${noteString}${minorChord}`, "g");

String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};

const constructChord = function(totalLength, chords, offsets) {
  let blankChord = Array(totalLength).join(" ");
  for(let i = 0; i < offsets.length; i++) {
    blankChord = blankChord.replaceAt(offsets[i], chords[i]);
  }
  return blankChord.trimEnd();
};

// Make complicated chords easier for beginners
// i.e. Am7 -> Am, Dsus4 -> D
const simplifyChord = function(chord) {
  const chords = [];
  const offsets = [];

  const chordBoundary = new RegExp(/\S+/, "g");
  chord.replace(chordBoundary, function(originalChord, offset) {
    const simpleChord = originalChord.match(simpleChordRegex)[0];
    chords.push(simpleChord);
    offsets.push(offset);
  });

  return constructChord(chord.length, chords, offsets);
};

export var songView = new function() {
  var currentInstrument = localStorage.getItem("instrument") || "none";

  this.getInstrument = function() {
    return currentInstrument;
  };

  this.setInstrument = function(newInstrument) {
    localStorage.setItem("instrument", newInstrument);
    currentInstrument = newInstrument;
  };

  var orientation = localStorage.getItem("orientation") || "right";

  this.getOrientation = function() {
    return orientation;
  };

  this.setOrientation = function(newOrientation) {
    localStorage.setItem("orientation", newOrientation);
    orientation = newOrientation;
  };

  // chordOption = original | simple
  let chordOption = localStorage.getItem("chordOption") || "simple";

  this.getChordOption = function() {
    return chordOption;
  };

  this.setChordOption = function(newPreference) {
    localStorage.setItem("chordOption", newPreference);
    chordOption = newPreference;
  };

  var lines = [];
  var allChords = [];
  var overrideAllChords = [];
  var fullSongName = "";

  this.getChords = function() {
    return allChords;
  };

  var capo = 0;

  this.getCapo = function() {
    return capo;
  };

  const setCapo = function(newCapo) {
    if (newCapo) {
      capo = parseInt(newCapo);
    } else {
      capo = 0;
    }
  };

  const transposeChord = function(chord, amount) {
    const shouldSimplify = chordOption === "simple";
    let chordToTranspose = chord;
    if (shouldSimplify) {
      chordToTranspose = simplifyChord(chord);
    }
    return chordToTranspose.replace(noteRegex, function(pitch) {
      return fifthsToPitch.get(pitchToFifths.get(pitch) + amount);
    });
  };


  this.getFullSongName = function() {
    return fullSongName;
  };

  this.setSong = function(data) {
    allChords = data["allChords"];
    overrideAllChords = data["overrideAllChords"];
    let count = 0;
    lines = data["lines"].map(line => "lyrics" in line ? Object.assign({ count: count++ }, line) : line);

    capo = data["capo"];
    setCapo(capo);

    fullSongName = data["id"];
  };


  var songId;

  this.getId = function() {
    return songId;
  };

  this.setId = function(newId) {
    songId = newId;
  };

  var transpose = localStorage.getItem("transpose") || 0; // # of steps transposed, range -6 to 6

  this.getTranspose = function() {
    return transpose;
  };

  this.setTranspose = function(newTranspose) {
    transpose = parseInt(newTranspose);
    localStorage.setItem("transpose", transpose);
  };

  this.getData = function() {
    var allFifths = [].concat.apply([], allChords.map(function(chord) {
      const chordTypes = "(m\b|madd|msus|dim)?";
      const chordRegex = new RegExp(`^(${noteString})${chordTypes}`);
      var m = chord.match(chordRegex);
      return m ? [pitchToFifths.get(m[1]) - (m[2] ? 3 : 0)] : [];
    }));
    var center = Math.round(allFifths.reduce(function(a, b) { return a + b; }) / allFifths.length);
    // Transpose the average chord no flatter than Ab or Fm and no sharper than C# or A#m.
    var amount = (transpose * 7 + center + 12004) % 12 - center - 4;

    var data = {};
    const transposedAllChords = allChords.slice().map(function(chord) {
      return transposeChord(chord, amount);
    });
    data["allChords"] = Array.from(new Set(transposedAllChords));
    if(overrideAllChords && transpose == 0) {
      data["allChords"] = overrideAllChords;
    }

    data["lines"] = lines.slice().map(function(line) {
      var newLine = $.extend({}, line);
      if (newLine["chord"]) {
        newLine["chord"] = transposeChord(line["chord"], amount);
      }
      return newLine;
    });

    data["instrument"] = currentInstrument;
    return data;
  };
};
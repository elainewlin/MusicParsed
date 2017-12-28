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

function transposeChord(chord, amount) {
  return chord.replace(/[A-G](?:bb|𝄫|b|♭|#|♯|x|𝄪)?/g, function(pitch) {
    return fifthsToPitch.get(pitchToFifths.get(pitch) + amount);
  });
}

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

  var lines = [];
  var allChords = [];

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

  this.setSong = function(data) {
    allChords = data["allChords"];
    let count = 0;
    lines = data["lines"].map(line => "lyrics" in line ? Object.assign({ count: count++ }, line) : line);

    capo = data["capo"];
    setCapo(capo);
  };

  // Default song
  var songName = "viva_la_vida - coldplay";

  this.getName = function() {
    return songName;
  };

  this.setName = function(newName) {
    songName = newName;
  };

  var transpose = 0; // # of steps transposed, range -6 to 6

  this.getTranspose = function() {
    return transpose;
  };

  this.setTranspose = function(newTranspose) {
    transpose = parseInt(newTranspose);
  };

  this.getData = function() {
    var allFifths = [].concat.apply([], allChords.map(function(chord) {
      var m = chord.match(/^([A-G](?:bb|𝄫|b|♭|#|♯|x|𝄪)?)(m\b|madd|msus|dim)?/);
      return m ? [pitchToFifths.get(m[1]) - (m[2] ? 3 : 0)] : [];
    }));
    var center = Math.round(allFifths.reduce(function(a, b) { return a + b; }) / allFifths.length);
    // Transpose the average chord no flatter than Ab or Fm and no sharper than C# or A#m.
    var amount = (transpose * 7 + center + 12004) % 12 - center - 4;

    var data = {};
    data["allChords"] = allChords.slice().sort().map(function(chord) {
      return transposeChord(chord, amount);
    });
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
var accidentalFifths = [["bb", -14], ["b", -7], ["", 0], ["#", 7], ["x", 14]];
var letterFifths = [["F", -1], ["C", 0], ["G", 1], ["D", 2], ["A", 3], ["E", 4], ["B", 5]];

var pitchFifths = [].concat.apply([], accidentalFifths.map(function(af) {
    return letterFifths.map(function(lf) {
        return [lf[0] + af[0], lf[1] + af[1]];
    });
}));

var pitchToFifths = new Map(pitchFifths);
var fifthsToPitch = new Map(pitchFifths.map(function(pf) { return [pf[1], pf[0]]; }));

function transposeChord(chord, amount) {
    return chord.replace(/[A-G](?:#|x|bb?)?/g, function(pitch) {
        return fifthsToPitch.get(pitchToFifths.get(pitch) + amount);
    });
}

var songView = new function() {
    var currentInstrument = 'ukulele';

    this.getInstrument = function() {
        return currentInstrument;
    };

    this.setInstrument = function(newInstrument) {
        currentInstrument = newInstrument;
    };

    var lines = [];
    var allChords = [];

    this.getChords = function() {
        return allChords;
    };

    this.setSong = function(data) {
        allChords = data["allChords"];
        lines = data["lines"];
    };

    // Default song
    var songName = "viva_la_vida - coldplay";

    this.getName = function() {
        return songName;
    };

    this.setName = function(newName) {
        songName = newName;
    };

    var key = 0; // # of steps transposed, range -6 to 6

    this.getKey = function() {
        return key;
    };

    this.setKey = function(newKey) {
        key = parseInt(newKey);
    };

    this.getData = function() {
        var allFifths = [].concat.apply([], allChords.map(function(chord) {
            var m = chord.match(/^([A-G](?:#|x|bb?)?)(m\b|madd|msus|dim)?/);
            return m ? [pitchToFifths.get(m[1]) - (m[2] ? 3 : 0)] : [];
        }));
        var center = Math.round(allFifths.reduce(function(a, b) { return a + b; }) / allFifths.length);
        // Transpose the average chord no flatter than Ab or fm and no sharper than C# or a#m.
        var amount = (key * 7 + center + 12004) % 12 - center - 4;

        var data = {};
        data["allChords"] = allChords.slice().sort().map(function(chord) {
            return transposeChord(chord, amount);
        });
        data["lines"] = lines.slice().map(function(line) {
            var newLine = $.extend({}, line);
            if(newLine["chord"]) {
                newLine["chord"] = transposeChord(line["chord"], amount);
            }
            return newLine;
        });

        data["instrument"] = currentInstrument;
        return data;
    }

};
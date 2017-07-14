function transposeChord(chord, amount) {

    var chordToIndex = {
        "C": 0,
        "C#": 1,
        "Db": 1,
        "D": 2,
        "D#": 3,
        "Eb": 3,
        "E": 4,
        "F": 5,
        "F#": 6,
        "Gb": 6,
        "G": 7,
        "G#": 8,
        "Ab": 8, 
        "A": 9,
        "A#": 10,
        "Bb": 10,
        "B": 11,
        "Cb": 11
    };

    var sharpScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    var flatScale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    var numNotes = 12;

    // TO-DO support sharps and flats, adjust for key signatures with only flats: Eb, Ab, Bb
    var isSharp = true; 
    var scale = isSharp ? sharpScale: flatScale;

    return chord.replace(/[CDEFGAB]#?b?/g,
    function(index) {
        var i = (chordToIndex[index] + parseInt(amount)) % numNotes;
        return scale[ i < 0 ? i + numNotes : i ];
    });
}

var songView = new function() {
    var instruments = ["guitar", "ukulele"];
    var currentInstrument = instruments[1];

    this.getInstrument = function() {
        return currentInstrument;
    };

    this.toggleInstrument = function() {
        currentInstrument = instruments[(instruments.indexOf(currentInstrument) + 1) % instruments.length];
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
    var songName = "Viva la Vida - Coldplay";

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
        key = newKey;
    };

    this.getData = function() {
        data = {};
        data["allChords"] = allChords.slice().sort().map(function(chord) {
            return transposeChord(chord, key).replace("#", "%23");
        });
        data["lines"] = lines.slice().map(function(line) {
            var newLine = $.extend({}, line);
            if(newLine["chord"]) {
                newLine["chord"] = transposeChord(line["chord"], key);
            }
            return newLine;
        });

        data["instrument"] = currentInstrument;
        return data;
    }

};
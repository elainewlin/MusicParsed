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
    this.currentInstrument = instruments[1];
    this.toggleInstrument = function() {
        this.currentInstrument = instruments[(instruments.indexOf(this.currentInstrument) + 1) % instruments.length];
    }

    this.lines = [];
    this.allChords = [];

    this.songName = "Viva la Vida - Coldplay";

    // BUG - should convert key of song, not transpose multiple times
    this.step = 0;

    this.transpose = function(step) {
        this.allChords = this.allChords.map(function(chord) {
            return transposeChord(chord, step);
        })

        songView["lines"].map(function(line) {
            if(line["chord"]) {
                var transpose = transposeChord(line["chord"], step);
                line["chord"] = transpose;
            }
        })
    }

}
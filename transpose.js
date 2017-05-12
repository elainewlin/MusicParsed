$(document).ready(function() {

    function transposeChord(chord, amount) {

      var chordToIndex = {
        "C": 0,
        "C#": 1,
        "Db": 1,
        "D": 2,
        "Eb": 3,
        "E": 4,
        "F": 5,
        "F#": 6,
        "Gb": 6,
        "G": 7,
        "Ab": 8, 
        "A": 9,
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
    
    $("input[type=radio]").click(function(e) {
        var labels = $(e.target.parentNode.parentNode).find("label"); // all transpose or all column labels
        labels.removeClass("selected");
        var target = $(e.target.parentNode);
        target.addClass("selected");
    });

    $("#transpose").find("input").click(function(e) {
        var song = $("#title").text().trim();
        var step = $(e.target.parentNode).data()["step"];
        $.getJSON("./template/json/"+song+".json", function(data) {
            data["allChords"] = data["allChords"].map(function(chord) {
                return transposeChord(chord, step).replace("#", "%23");
            });
         
            data["lines"].map(function(line) {
                if(line["chord"]) {
                    line["chord"] = transposeChord(line["chord"],step);
                }
            })
            rerender(data);
        });
    })
    
});

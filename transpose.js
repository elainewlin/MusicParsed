$(document).ready(function() {

    // TO-DO handle sharps and flats
    function transposeChord(chord, amount) {
      var scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      return chord.replace(/[CDEFGAB]#?/g,
       function(match) {
         var i = (scale.indexOf(match) + parseInt(amount)) % scale.length;
         return scale[ i < 0 ? i + scale.length : i ];
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

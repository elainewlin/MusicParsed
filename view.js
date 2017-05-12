$(document).ready(function() {

    function toggleChords() {
        $("#chordPics").toggle(); 

        if($("#chordPics").is(":visible")) {
            $("#chordToggle").text("hide");
        }
        else {
            $("#chordToggle").text("show");
        }
    }

    $("#chordToggle").click(function() {
       toggleChords();
    })

    $("#chordPics").click(function() {
        toggleChords();
    })

    $("#viewToggle").click(function() {
        $("#column-count").toggle(); 
        $("#transpose").toggle(); 
    })
    $("#instrumentToggle").click(function() {
        var currentInstrument = $("#song").data()["instrument"];
        var instruments = ["guitar", "ukulele"];

        var newInstrument = instruments[(instruments.indexOf(currentInstrument) + 1) % instruments.length];

        data = {}
        data["allChords"] = $("#song").data()["allChords"];
        data["instrument"] = newInstrument;
        renderChords(data);
    })

    $("#column-count").find("input").click(function(e) {
        var colCount = $(e.target.parentNode).data()["column"]
        $("#song").css("column-count", colCount);
    });
    
})
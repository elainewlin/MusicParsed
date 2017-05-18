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

    $("#songsToggle").click(function() {
        showAllSongs();
    })

    $("#viewToggle").click(function() {
        $("#column-count").toggle(); 
        $("#transpose").toggle(); 
    })
    $("#instrumentToggle").click(function() {
        songView.toggleInstrument();
        renderChords(songView.getData());
    })

    $("#column-count").find("input").click(function(e) {
        var colCount = $(e.target.parentNode).data()["column"]
        $("#song").css("column-count", colCount);
    });

    // View for transpose and column widgets
    $("input[type=radio]").click(function(e) {
        var labels = $(e.target.parentNode.parentNode).find("label"); 
        labels.removeClass("selected");
        var target = $(e.target.parentNode);
        target.addClass("selected");
    });

    $("#transpose").find("input").click(function(e) {
        var newKey = $(e.target.parentNode).data()["key"];
        songView.setKey(newKey);
        rerender(songView.getData());
    })
    
})
$(document).ready(function() {
    $("#chordToggle").click(function() {
        $("#chordPics").toggle(); 
    })

    $("#chordPics").click(function() {
        $("#chordPics").toggle(); 
    })

   $("#viewToggle").click(function() {
        $("#column-count").toggle(); 
        $("#transpose").toggle(); 
    })

    $("#column-count").find("input").click(function(e) {
        var colCount = $(e.target.parentNode).data()["column"]
        $("#song").css("column-count", colCount);
    });
    
})
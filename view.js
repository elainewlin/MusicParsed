$(document).ready(function() {
    $("#chordPics").click(function() {
        $("#chordPics").toggle(); 
       
    })

    $("#column-count").find("input").click(function(e) {
        console.log(e);
        var id = e.target.parentNode.id;
        console.log(id);
        id = id.replace("col-", "");
        $("#song").css("column-count", id);
    });
    
})
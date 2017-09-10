import $ from "jquery";

$(document).ready(function() {
    $("#importText").click(function() {
        console.log($("#addText").val());
        console.log("Importing text");
    });


    $("#importURL").click(function() {
        console.log($("#addURL").val());
        console.log("Importing URL");
    });
});
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/import.css";

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
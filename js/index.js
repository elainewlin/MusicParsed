import "babel-polyfill";
import $ from "jquery";
import { songView } from "./model.js";
import { initRender, loadSong } from "./render.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/styles.css";

$(document).ready(function() {
  initRender();
  var dataset = document.documentElement.dataset;
  // stupid check to make sure we don't load blank songs
  if (dataset.title) {
    var newSong = dataset.title + " - " + dataset.artist;
    loadSong(newSong);
  } else {
    // Default song
    loadSong(songView.getName());
  }
});
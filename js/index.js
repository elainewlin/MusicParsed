import "babel-polyfill";
import $ from "jquery";
import { songView } from "./model.js";
import { initRender, loadSongTranspose } from "./render.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/styles.css";

$(document).ready(function() {
  initRender();
  var dataset = document.documentElement.dataset;
  // stupid check to make sure we don't load blank songs
  if (dataset.title) {
    var newSong = dataset.title + " - " + dataset.artist;
    loadSongTranspose(newSong, 0);
  } else {
    // Default song
    loadSongTranspose(songView.getName(), 0);
  }
});
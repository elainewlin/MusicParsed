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
    var songId = dataset.title + " - " + dataset.artist;
    songView.setTranspose(dataset.transpose);
    loadSong(songId);
  } else {
    // Default song
    loadSong(songView.getId());
  }
});
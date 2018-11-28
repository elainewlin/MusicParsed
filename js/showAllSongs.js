import "@babel/polyfill";
import $ from "jquery";
import "../css/styles.css";
import "../css/global.css";
import allSongsListTemplate from "../mustache/allSongsList.mustache";
import {songSearch} from "./render.js";

// Helper function for sorting arrays of objects by property
var comparator = function(property) {
  return function(obj1, obj2) {
    var prop1 = obj1[property];
    var prop2 = obj2[property];

    if (prop1 < prop2) { //sort string ascending
      return -1;
    }
    if (prop1 > prop2) {
      return 1;
    }
    return 0; //default return value (no sorting)
  };
};

window.onload = function() {
  const allSongs = {};

  $.ajax({
    url: "/static/data/ALL_SONGS.json",
    dataType: "json",
    success: function(data) {
      data.map(function(song) {

        // Sorting by artist
        const artist = song["artist"];

        if (allSongs.hasOwnProperty(artist)) {
          allSongs[artist].push(song);
        } else {
          allSongs[artist] = [song];
        }
      });

      let allSongsByArtist = [];
      for (let artist in allSongs) {
        // Song titles in alphabetical order
        const songsByArtist = allSongs[artist].sort(comparator("title"));
        allSongsByArtist.push({ "artist": artist, "songs": songsByArtist });
      }
      // Artists in alphabetical order
      allSongsByArtist = allSongsByArtist.sort(comparator("artist"));

      document.getElementById("allSongs").innerHTML = allSongsListTemplate({ allSongs: allSongsByArtist });
    }
  });

  const loadSongUrl = function(song) {
    window.location.href = song.url;
  };
  songSearch(loadSongUrl);
};
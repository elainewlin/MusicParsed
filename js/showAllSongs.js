import "babel-polyfill";
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
  var allSongs = {};

  // TO DO #36 clean up data storage for allSongs
  $.ajax({
    url: "/static/data/ALL_SONGS.json",
    dataType: "json",
    success: function(data) {
      data.map(function(song) {

        // Sorting by artist
        var artist = song["artist"];

        if (allSongs.hasOwnProperty(artist)) {
          allSongs[artist].push(song);
        } else {
          allSongs[artist] = [song];
        }
      });

      var allSongsByArtist = [];
      for (var tag in allSongs) {
        // Song titles in alphabetical order
        allSongs[tag] = allSongs[tag].sort(comparator("title"));
        allSongsByArtist.push({ "tag": tag, "songs": allSongs[tag] });
      }
      // Artists in alphabetical order
      allSongsByArtist = allSongsByArtist.sort(comparator("tag"));

      document.getElementById("allSongs").innerHTML = allSongsListTemplate({ allSongs: allSongsByArtist });
    }
  });

  const loadSongUrl = function(song) {
    window.location.href = song.url;
  }
  songSearch(loadSongUrl);
};
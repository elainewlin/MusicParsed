import "babel-polyfill";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/styles.css";
import "../css/global.css";
import allSongsListTemplate from "../mustache/allSongsList.mustache";

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
  }
};

window.onload = function() {
  var allSongs = {};

  // TO DO clean up variable naming, what is sorted even?
  $.ajax({
    url: "/static/data/allSongs.json",
    dataType: "json",
    success: function(data) {
      data.map(function(song) {

        // Sorting by artist
        var id = song["id"];
        var title = song["title"];
        var artist = song["artist"];

        if(allSongs.hasOwnProperty(artist)) {
          allSongs[artist].push(song);
        }
        else {
          allSongs[artist] = [song];
        }
      });

      var allSongsByArtist = [];
      for(var tag in allSongs) {
        // Song titles in alphabetical order
        allSongs[tag] = allSongs[tag].sort(comparator("title"));
        allSongsByArtist.push({"tag": tag, "songs": allSongs[tag]});
      }
      // Artists in alphabetical order
      allSongsByArtist = allSongsByArtist.sort(comparator("tag"));

      document.getElementById('allSongs').innerHTML = allSongsListTemplate({allSongs: allSongsByArtist});
    }
  });
};
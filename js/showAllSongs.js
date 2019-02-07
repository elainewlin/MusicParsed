import $ from "jquery";
import "../css/styles.css";
import "../css/global.css";
import allSongsListTemplate from "../mustache/allSongsList.mustache";
import buttonTemplate from "../mustache/button.mustache";
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

const sortSongsByArtist = function(songs) {
  const allSongs = {};
  songs.map(function(song) {
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
  return allSongsByArtist;
};

const ALL_TAG = "all";
let selectedTag = ALL_TAG;
const allSongsByTag = {};

const renderSelectedSongs = function(selectedTag) {
  const songsToRender = allSongsByTag[selectedTag];
  const sortedSongs = sortSongsByArtist(songsToRender);

  document.getElementById("allSongs").innerHTML = allSongsListTemplate({
    allSongs: sortedSongs,
  });
};

window.onload = function() {
  $.ajax({
    url: "/static/data/ALL_SONGS.json",
    dataType: "json",
    success: function(data) {
      const allTags = new Set();
      const allSongs = [];

      allTags.add(ALL_TAG);
      data.map(function(song) {
        allSongs.push(song);

        const tags = song["tags"];
        tags.map((tag) => {
          allTags.add(tag);
          if (allSongsByTag.hasOwnProperty(tag)) {
            allSongsByTag[tag].push(song);
          } else {
            allSongsByTag[tag] = [song];
          }
        });
      });
      allSongsByTag[ALL_TAG] = allSongs;

      const allTagButtons = Array.from(allTags).map((tag) => {
        return {
          type: "tag",
          name: tag,
          value: tag
        };
      });
      document.getElementById("allTags").innerHTML = buttonTemplate({
        buttons: allTagButtons
      });

      renderSelectedSongs(selectedTag);
    }
  });

  const loadSongUrl = function(song) {
    window.location.href = song.url;
  };

  songSearch(loadSongUrl);
};

$(document).on("change", "input", function(e) {
  selectedTag = e.target.value;
  renderSelectedSongs(selectedTag);
});


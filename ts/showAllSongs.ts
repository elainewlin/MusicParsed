import $ from "jquery";
import "../css/styles.css";
import "../css/global.css";
import allSongsListTemplate from "../mustache/allSongsList.mustache";
import buttonTemplate from "../mustache/button.mustache";
import { Song, songSearch } from "../web/songView";
import { selectButton } from "./controller";

// Helper function for sorting arrays of objects by property
const comparator = function<Property extends string>(
  property: Property
): (
  obj1: { [_ in Property]: string },
  obj2: { [_ in Property]: string }
) => number {
  return function(obj1, obj2) {
    const prop1 = obj1[property];
    const prop2 = obj2[property];

    if (prop1 < prop2) {
      //sort string ascending
      return -1;
    }
    if (prop1 > prop2) {
      return 1;
    }
    return 0; //default return value (no sorting)
  };
};

const sortSongsByArtist = function(
  songs: Song[]
): { artist: string; songs: Song[] }[] {
  const allSongs: { [artist: string]: Song[] } = {};
  songs.map(song => {
    // Sorting by artist
    const artist = song["artist"];

    if (allSongs.hasOwnProperty(artist)) {
      allSongs[artist].push(song);
    } else {
      allSongs[artist] = [song];
    }
  });

  const allSongsByArtist = [];
  for (const artist in allSongs) {
    // Song titles in alphabetical order
    const songsByArtist = [...allSongs[artist]];
    songsByArtist.sort(comparator("title"));
    allSongsByArtist.push({ artist: artist, songs: songsByArtist });
  }
  // Artists in alphabetical order
  allSongsByArtist.sort(comparator("artist"));
  return allSongsByArtist;
};

const ALL_TAG = "all";
const TAG_TYPE = "tag";
let selectedTag = ALL_TAG;
const allSongsByTag = new Map();

const renderSelectedSongs = function(selectedTag: string): void {
  selectButton(TAG_TYPE, selectedTag);
  const songsToRender = allSongsByTag.get(selectedTag);
  const sortedSongs = sortSongsByArtist(songsToRender);

  document.getElementById("allSongs")!.innerHTML = allSongsListTemplate({
    allSongs: sortedSongs,
  });
};

window.onload = function() {
  $.ajax({
    url: "/static/data/ALL_SONGS.json",
    dataType: "json",
    success: function(data: Song[]) {
      const allTags = new Set();
      const allSongs: Song[] = [];

      allTags.add(ALL_TAG);
      data.map((song: Song) => {
        allSongs.push(song);
        const tags = song["tags"];
        tags.map(tag => {
          allTags.add(tag);
          if (!allSongsByTag.has(tag)) {
            allSongsByTag.set(tag, []);
          }
          allSongsByTag.get(tag).push(song);
        });
      });
      allSongsByTag.set(ALL_TAG, allSongs);

      const allTagButtons = Array.from(allTags)
        .sort()
        .map(tag => ({
          type: TAG_TYPE,
          name: tag,
          value: tag,
        }));
      document.getElementById("allTags")!.innerHTML = buttonTemplate({
        buttons: allTagButtons,
      });

      renderSelectedSongs(selectedTag);

      $("#allTags")
        .find("input")
        .change(e => {
          selectedTag = (e.target as HTMLInputElement).value;
          renderSelectedSongs(selectedTag);
        });
    },
  });

  const loadSongUrl = function(song: Song): void {
    window.location.href = song.url;
  };

  songSearch(loadSongUrl);
};

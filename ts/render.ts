import "core-js/fn/array/flat-map";
import $ from "jquery";
import "jquery-ui/ui/widgets/autocomplete";
import "jquery-ui/themes/base/all.css";
import { renderAllChords } from "../lib/fingering";
import { SongData } from "../lib/song";
import { renderLines } from "../lib/parser";
import { loadWidgets, renderTranspose } from "./controller";
import { songView } from "./model";
import songTemplate from "../mustache/song.mustache";

export const renderChords = function(): void {
  const data = songView.getData();
  const currentInstrument = songView.getInstrument();

  const chordPics = $(".chordPics");
  if (currentInstrument == "none") {
    chordPics.hide();
    return;
  }
  chordPics.show();

  document.getElementsByClassName("chordPics")[0].innerHTML = renderAllChords(
    data.allChords,
    currentInstrument,
    songView.getOrientation()
  );
};

const renderCapo = function(): void {
  const capo = songView.getCapo();
  if (capo) {
    $("#capo").show();
    $("#capoAmount").text(`capo ${capo}`);
  } else {
    $("#capo").hide();
  }
};

export const rerender = function(): void {
  const data = songView.getData();
  const fullName = songView.getFullSongName();
  $("#title").text(fullName);

  document.getElementById("song")!.innerHTML = songTemplate({
    lines: renderLines(data["lines"]),
  });
  renderTranspose();
  renderChords();
};

export const loadSong = function(songId: string): void {
  $.getJSON("/static/data/json/" + songId + ".json", (data: SongData) => {
    songView.setId(songId);
    songView.setSong(data);
    renderCapo();
    rerender();
  });
};

export const popStateHandler = function(
  history: History | PopStateEvent
): void {
  let transposeAmount = 0;
  let songId;

  const dataset = document.documentElement.dataset;

  if (history.state) {
    if (history.state.transpose) {
      transposeAmount = history.state.transpose;
    }
    songId = history.state.id;
  } else {
    if (dataset.transpose) {
      transposeAmount = +dataset.transpose;
    }
    songId = dataset.title + " - " + dataset.artist;
  }

  songView.setTranspose(transposeAmount);
  loadSong(songId);
};

export interface Song {
  artist: string;
  id: string;
  label: string;
  tags: string[];
  title: string;
  url: string;
  value: string;
}

export const songSearch = function(
  songLoadFunction: (song: Song) => void
): void {
  $("#tags").autocomplete({
    autoFocus: true,
    source: function(
      request: { term: string },
      response: (matches: Song[]) => void
    ) {
      $.ajax({
        url: "/static/data/ALL_SONGS.json",
        dataType: "json",
        data: {
          term: request.term,
        },
        success: function(data: Song[]) {
          const re = $.ui.autocomplete.escapeRegex(request.term);
          const matcher = new RegExp(re, "i");
          const matches = $.grep(
            data,
            (item: Song) => matcher.test(item["value"]) // searching by song ID
          );
          response(matches);
        },
      });
    },
    select: function(event, ui) {
      songLoadFunction(ui.item);
    },
  });

  const getRandomIndex = function(totalSongs: number): number {
    return Math.floor(Math.random() * totalSongs) + 1;
  };

  $.ajax({
    url: "/static/data/ALL_SONGS.json",
    dataType: "json",
    success: function(data) {
      $(".random").click(() => {
        const randomSong = data[getRandomIndex(data.length)];
        songLoadFunction(randomSong);
      });
    },
  });

  $(".random").tooltip();
};

export const initRender = function(): void {
  loadWidgets();

  const loadSongNoRefresh = function(song: { id: string; url: string }): void {
    const id = song.id;
    const url = song.url;

    window.history.pushState({ id: id }, "", `${url}`);
    songView.setTranspose(0);
    loadSong(id);
  };

  songSearch(loadSongNoRefresh);
};

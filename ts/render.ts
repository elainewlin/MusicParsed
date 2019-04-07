import "core-js/fn/array/flat-map";
import $ from "jquery";
import "jquery-ui/ui/widgets/autocomplete";
import "jquery-ui/themes/base/all.css";
import { loadWidgets, renderTranspose } from "./controller";
import { renderChord, renderLines, instrumentsData } from "./songParser";
import { SongData, songView } from "./model";
import chordsTemplate from "../mustache/chords.mustache";
import songTemplate from "../mustache/song.mustache";

export const renderAllChords = function(allChords: string[], currentInstrument: string): void {
  const instrumentData = instrumentsData[currentInstrument];
  var chordData = {
    strings: instrumentData.strings,
    stringsMinus1: instrumentData.strings - 1,
    frets: instrumentData.frets,
    fretsPlusHalf: instrumentData.frets + 0.5,
    viewHeight: instrumentData.frets + 1.5,
    height: (instrumentData.frets + 1.5) * 11,
    stringLines: Array.apply(null, Array(instrumentData.strings - 2)).map(function(_, i) {
      return i + 1;
    }),
    fretLines: Array.apply(null, Array(instrumentData.frets)).map(function(_, i) {
      return i + 0.5;
    }),
    chords: allChords.flatMap(function(chord) {
      return renderChord(chord, instrumentData, songView.getOrientation());
    }),
  };
  document.getElementsByClassName("chordPics")[0].innerHTML = chordsTemplate(chordData);
};

export var renderChords = function(): void {
  const data = songView.getData();
  var currentInstrument = songView.getInstrument();

  const chordPics = $(".chordPics");
  if (currentInstrument == "none") {
    chordPics.hide();
    return;
  }
  chordPics.show();

  renderAllChords(data.allChords, currentInstrument);
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

export var rerender = function(): void {
  const data =  songView.getData();
  const fullName = songView.getFullSongName();
  $("#title").text(fullName);

  document.getElementById("song")!.innerHTML = songTemplate({
    lines: renderLines(data["lines"])
  }); 
  renderTranspose();
  renderChords();
};

export var loadSong = function(songId: string): void {
  $.getJSON("/static/data/json/" + songId + ".json", function(data: SongData) {
    songView.setId(songId);
    songView.setSong(data);
    renderCapo();
    rerender();
  });
};

export var popStateHandler = function(history: History | PopStateEvent): void {
  let transposeAmount = 0;
  let songId;

  let dataset = document.documentElement.dataset;

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

export var songSearch = function(songLoadFunction: (song: Song) => void): void {
  $("#tags").autocomplete({
    autoFocus: true,
    source: function(request: { term: string }, response: (matches: Song[]) => void) {
      $.ajax({
        url: "/static/data/ALL_SONGS.json",
        dataType: "json",
        data: {
          term: request.term
        },
        success: function(data: Song[]) {
          var re = $.ui.autocomplete.escapeRegex(request.term);
          var matcher = new RegExp(re, "i");
          var matches = $.grep(data, function(item: Song) {
            return matcher.test(item["value"]); // searching by song ID
          });
          response(matches);
        }
      });
    },
    select: function(event, ui) {
      songLoadFunction(ui.item);
    }
  });

  const getRandomIndex = function(totalSongs: number): number {
    return Math.floor(Math.random() * totalSongs) + 1;
  };

  $.ajax({
    url: "/static/data/ALL_SONGS.json",
    dataType: "json",
    success: function(data) {
      $(".random").click(function() {
        const randomSong = data[getRandomIndex(data.length)];
        songLoadFunction(randomSong);
      });
    }
  });

  $(".random").tooltip();
};

export var initRender = function(): void {
  loadWidgets();

  const loadSongNoRefresh = function(song: {id: string; url: string}): void {
    const id = song.id;
    const url = song.url;

    window.history.pushState({"id": id}, "", `${url}`);
    songView.setTranspose(0);
    loadSong(id);
  };

  songSearch(loadSongNoRefresh);
};
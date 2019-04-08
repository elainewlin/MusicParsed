import "core-js/fn/array/flat-map";

import $ from "jquery";
import "jquery-ui/ui/widgets/autocomplete";
import "jquery-ui/themes/base/all.css";
import {
  simplifyChord,
  transposeChord,
  transposeAmountToFifths,
} from "../lib/chord";
import { renderAllChords } from "../lib/fingering";
import { SongLine, SongData } from "../lib/song";
import { renderLines } from "../lib/parser";
import { loadWidgets, renderTranspose } from "./controller";
import songTemplate from "../mustache/song.mustache";

interface SongView {
  getInstrument(): string;
  setInstrument(newInstrument: string): void;
  getOrientation(): string;
  setOrientation(newOrientation: string): void;
  getChordOption(): string;
  setChordOption(newPreference: string): void;
  getChords(): string[];
  getCapo(): number;
  setCapo(newCapo: string): void;
  getFullSongName(): string;
  setSong(data: SongData): void;
  getId(): string;
  setId(newId: string): void;
  getTranspose(): number;
  setTranspose(newTranspose: number): void;
  getData(): { allChords: string[]; lines: SongLine[]; instrument: string };
}

export const songView: SongView = new ((function SongView(this: SongView) {
  let currentInstrument = localStorage.getItem("instrument") || "none";

  this.getInstrument = function() {
    return currentInstrument;
  };

  this.setInstrument = function(newInstrument) {
    localStorage.setItem("instrument", newInstrument);
    currentInstrument = newInstrument;
  };

  let orientation = localStorage.getItem("orientation") || "right";

  this.getOrientation = function() {
    return orientation;
  };

  this.setOrientation = function(newOrientation) {
    localStorage.setItem("orientation", newOrientation);
    orientation = newOrientation;
  };

  // chordOption = original | simple
  let chordOption = localStorage.getItem("chordOption") || "original";

  this.getChordOption = function() {
    return chordOption;
  };

  this.setChordOption = function(newPreference) {
    localStorage.setItem("chordOption", newPreference);
    chordOption = newPreference;
  };

  let lines: SongLine[] = [];
  let allChords: string[] = [];
  let overrideAllChords: string[] | undefined = [];
  let fullSongName = "";

  this.getChords = function() {
    return allChords;
  };

  let capo = 0;

  this.getCapo = function() {
    return capo;
  };

  const setCapo = function(newCapo?: string): void {
    if (newCapo) {
      capo = parseInt(newCapo);
    } else {
      capo = 0;
    }
  };

  this.getFullSongName = function() {
    return fullSongName;
  };

  this.setSong = function(data) {
    allChords = data["allChords"];
    overrideAllChords = data["overrideAllChords"];
    let count = 0;
    lines = data["lines"].map(line =>
      "lyrics" in line ? Object.assign({ count: count++ }, line) : line
    );

    setCapo(data["capo"]);

    fullSongName = data["fullName"];
  };

  let songId: string;

  this.getId = function() {
    return songId;
  };

  this.setId = function(newId) {
    songId = newId;
  };

  let transpose = +(localStorage.getItem("transpose") || 0); // # of steps transposed, range -6 to 6

  this.getTranspose = function() {
    return transpose;
  };

  this.setTranspose = function(newTranspose) {
    transpose = newTranspose;
    localStorage.setItem("transpose", transpose.toString());
  };

  this.getData = function() {
    const amount = transposeAmountToFifths(allChords, transpose);

    let processChord = (chord: string): string => transposeChord(chord, amount);
    const shouldSimplify = chordOption === "simple";
    if (shouldSimplify) {
      processChord = (chord: string) =>
        transposeChord(simplifyChord(chord), amount);
    }

    const transposedAllChords = allChords.slice().map(processChord);
    let dataAllChords = Array.from(new Set(transposedAllChords));
    if (overrideAllChords && transpose == 0) {
      dataAllChords = overrideAllChords;
    }

    const dataLines = lines.slice().map(line => {
      const newLine = { ...line };
      if ("chord" in newLine) {
        newLine["chord"] = newLine["chord"].replace(/\S+/g, processChord);
      }
      return newLine;
    });

    return {
      allChords: dataAllChords,
      lines: dataLines,
      instrument: currentInstrument,
    };
  };
} as unknown) as { new (): SongView })();

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

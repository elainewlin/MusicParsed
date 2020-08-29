import "core-js/fn/array/flat-map";

import $ from "jquery";
import "jquery-ui/ui/widgets/autocomplete";
import "jquery-ui/themes/base/all.css";
import {
  simplifyChord,
  transposeChord,
  transposeAmountToFifths,
} from "../lib/chord";
import { getAllChordData } from "../lib/fingering";
import {
  RenderedLine,
  SongData,
  AllSongsResponse,
  SongResponse,
  ChordLyricLine,
} from "../lib/song";
import { loadWidgets, renderTranspose } from "./controller";
import chordsTemplate from "../mustache/chords.mustache";
import songTemplate from "../mustache/song.mustache";
import cache from "./cache";

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
  getData(): { allChords: string[]; lines: RenderedLine[]; instrument: string };
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

  let lines: RenderedLine[] = [];
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
    allChords = data.allChords;
    overrideAllChords = data.overrideAllChords;
    lines = data.lines;
    setCapo(data.capo);
    fullSongName = data.fullName;
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
    if (overrideAllChords && overrideAllChords.length && transpose == 0) {
      dataAllChords = overrideAllChords;
    }

    // Deep copy the object so we don't accidentally mutate lines :/
    let dataLines = JSON.parse(JSON.stringify(lines));
    dataLines = dataLines.map((line: ChordLyricLine) => {
      if ("chordLyricPairs" in line) {
        for (const pair of line.chordLyricPairs) {
          if (pair.chord !== null) {
            pair.chord = processChord(pair.chord);
          }
        }
      }
      return line;
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

  document.getElementsByClassName("chordPics")[0].innerHTML = chordsTemplate(
    getAllChordData(
      data.allChords,
      currentInstrument,
      songView.getOrientation()
    )
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
    lines: data.lines,
  });
  renderTranspose();
  renderChords();
};

export const loadSong = function(songId: string): void {
  $.getJSON(`/api/song/${songId}`, (response: SongResponse) => {
    const { data } = response;
    if (!data) {
      window.location.replace("/");
    }
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
    songId = history.state.songId;
  } else {
    if (dataset.transpose) {
      transposeAmount = +dataset.transpose;
    }
    songId = dataset.title + "-" + dataset.artist;
  }

  songView.setTranspose(transposeAmount);
  loadSong(songId);
};

const filterSongsByTerm = (data: SongData[], term: string) => {
  for (const song of data) {
    const songId = song.artist + " - " + song.title;
    song.label = songId;
    song.value = songId;
  }
  const filtered = $.ui.autocomplete.filter(data, term);
  return filtered;
};

export const songSearch = function(
  songLoadFunction: (song: SongData) => void
): void {
  $("#songSearch").autocomplete({
    minLength: 2,
    autoFocus: true,
    source: function(
      request: { term: string },
      response: (matches: SongData[]) => void
    ) {
      const cachedAllSongs = cache.getAllSongs();
      if (cachedAllSongs) {
        const filtered = filterSongsByTerm(cachedAllSongs, request.term);
        return response(filtered);
      }

      $.ajax({
        url: "/api/song",
        dataType: "json",
        success: function(apiResponse: AllSongsResponse) {
          const { data: allSongs } = apiResponse;

          // Cache API response
          cache.setAllSongs(allSongs);

          const filtered = filterSongsByTerm(allSongs, request.term);
          response(filtered);
        },
      });
    },
    select: function(event, ui) {
      songLoadFunction(ui.item);
    },
  });

  $("#random").click(event => {
    event.preventDefault();
    $.ajax({
      url: "/api/song/random",
      dataType: "json",
      success: function(apiResponse: SongResponse) {
        const { data } = apiResponse;
        songLoadFunction(data);
      },
    });
  });

  $("#random").tooltip();
};

export const initRender = function(): void {
  loadWidgets();

  const loadSongNoRefresh = function(song: SongData): void {
    const { songId, url } = song;
    if (!songId) {
      throw new Error("Song ID not found");
    }

    window.history.pushState({ songId }, "", `${url}`);
    songView.setTranspose(0);
    loadSong(songId);
  };

  songSearch(loadSongNoRefresh);
};

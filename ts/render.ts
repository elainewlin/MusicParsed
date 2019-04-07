import "core-js/fn/array/flat-map";
import $ from "jquery";
import "jquery-ui/ui/widgets/autocomplete";
import "jquery-ui/themes/base/all.css";
import { renderAllChords } from "../lib/fingering";
import { SongData, SongLine } from "../lib/song";
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

interface ChordLyricPair {
  chord: string | null;
  lyric: string;
  overLyric?: true;
}

interface ChordLyricLine {
  className: string;
  chordLyricPairs: ChordLyricPair[];
}

const renderChordLyricLine = function(
  chordString: string,
  lyrics: string
): ChordLyricLine {
  let className = "line";

  if (chordString.length > 0 && lyrics.length > 0) {
    className = "chordLyricLine";
  }

  /**
  Keep track of the chords + their offset positions in the string i.e.
  Dm      G
  Hello world
  has offset + chords (0, "Dm"), (8, "G")
  */
  const chordBoundary = new RegExp(/\S+/, "g");

  const offsetChordPairs: { offset: number; chord: string | null }[] = [];
  chordString.replace(chordBoundary, (chord, offset) => {
    offsetChordPairs.push({ offset, chord });
    return "";
  });
  if (offsetChordPairs.length === 0 || offsetChordPairs[0].offset !== 0) {
    offsetChordPairs.unshift({ offset: 0, chord: null });
  }
  const maxOffset = offsetChordPairs[offsetChordPairs.length - 1].offset;

  lyrics = lyrics.padEnd(maxOffset);
  offsetChordPairs.push({ offset: lyrics.length, chord: null });

  const chordLyricPairs: ChordLyricPair[] = [];

  for (let i = 0; i < offsetChordPairs.length - 1; i++) {
    const { offset: lastOffset, chord } = offsetChordPairs[i];
    const nextOffset = offsetChordPairs[i + 1].offset;
    const lyric = lyrics.slice(lastOffset, nextOffset);
    if (chord === null || /[^ ]/.test(lyric.slice(0, chord.length + 1))) {
      chordLyricPairs.push({ chord, lyric, overLyric: true });
    } else {
      chordLyricPairs.push({ chord, lyric: lyric.slice(chord.length) });
    }
  }

  return {
    className: className,
    chordLyricPairs: chordLyricPairs,
  };
};

type RenderedLine =
  | {
      label: string;
    }
  | ChordLyricLine;

const renderLines = function(lines: SongLine[]): RenderedLine[] {
  const newLines: RenderedLine[] = [];

  lines.map(line => {
    if ("label" in line) {
      newLines.push({
        label: line["label"],
      });
    } else {
      const chordString = line["chord"];
      const lyrics = line["lyrics"];
      newLines.push(renderChordLyricLine(chordString, lyrics));
    }
  });
  return newLines;
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

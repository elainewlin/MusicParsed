import "core-js/fn/array/flat-map";
import $ from "jquery";
import "jquery-ui/ui/widgets/autocomplete";
import "jquery-ui/themes/base/all.css";
import { loadWidgets, renderTranspose } from "./controller";
import { SongData, SongLine, songView } from "./model";
import { pitchToSemitones } from "../lib/pitch";
import { InstrumentData, instrumentsData } from "../lib/instrument";
import chordsTemplate from "../mustache/chords.mustache";
import songTemplate from "../mustache/song.mustache";

// Support for left-handed chord diagrams
const reverseString = function(str: string): string {
  return str
    .split("")
    .reverse()
    .join("");
};

type ChordFingeringData =
  | {
      viewLeft: number;
      viewWidth: number;
      width: number;
      chordName: string;
      offset?: number;
      openY: number;
      dots: { x: number; y: number }[];
      open: number[];
      mute: number[];
    }
  | {
      chordName: string;
      unknown: true;
    };

// Input example:
// chordName: Bm
// chordFingering: 4,2,2,2 for G,C,E,A
// instrumentData: what instrument?
// Output: SVG rendering of the chord
const renderChordFingering = function(
  chordName: string,
  chordFingeringStr: string,
  instrumentData: InstrumentData
): ChordFingeringData[] {
  const chordFingering = chordFingeringStr.split(",");
  const offset = chordFingering.every(
    y => !(+y > 0) || +y <= instrumentData.frets
  )
    ? 1
    : Math.min.apply(null, chordFingering.flatMap(y => (+y > 0 ? [+y] : [])));
  const left = offset == 1 ? 0 : 0.5 * ("" + offset).length;
  return [
    {
      viewLeft: -0.5 - left,
      viewWidth: instrumentData.strings + left,
      width: (instrumentData.strings + left) * 11,
      chordName: chordName,
      offset: offset == 1 ? undefined : offset,
      openY: offset == 1 ? -0.5 : 0,
      dots: chordFingering.flatMap((y, x) =>
        +y > 0 ? [{ x: x, y: +y - offset + 1 }] : []
      ),
      open: chordFingering.flatMap((y, x) => (+y == 0 ? [x] : [])),
      mute: chordFingering.flatMap((y, x) => (y == "x" ? [x] : [])),
    },
  ];
};

// Code is smart enough to auto-render chord thanks to regex magic
const renderChord = function(
  chord: string,
  instrumentData: InstrumentData
): ChordFingeringData[] {
  let chordName = chord;
  const m = chord.match(/^([A-G](?:bb|𝄫|b|♭|#|♯|x|𝄪)?)(.*)$/)!;
  let chordFingering = instrumentData.chords[pitchToSemitones(m[1])].get(m[2]);

  const overrideDefaultChord = chord.includes("|");
  if (overrideDefaultChord) {
    const chordComponents = chord.split("|");
    chordName = chordComponents[0];
    chordFingering = chordComponents[1];
  }

  if (chordFingering) {
    if (songView.getOrientation() === "left") {
      chordFingering = reverseString(chordFingering);
    }
    return renderChordFingering(chordName, chordFingering, instrumentData);
  } else {
    return [
      {
        chordName: chordName,
        unknown: true,
      },
    ];
  }
};

export const renderAllChords = function(
  allChords: string[],
  currentInstrument: string
): void {
  const instrumentData = instrumentsData[currentInstrument];
  const chordData = {
    strings: instrumentData.strings,
    stringsMinus1: instrumentData.strings - 1,
    frets: instrumentData.frets,
    fretsPlusHalf: instrumentData.frets + 0.5,
    viewHeight: instrumentData.frets + 1.5,
    height: (instrumentData.frets + 1.5) * 11,
    stringLines: Array.apply(null, Array(instrumentData.strings - 2)).map(
      (_, i) => i + 1
    ),
    fretLines: Array.apply(null, Array(instrumentData.frets)).map(
      (_, i) => i + 0.5
    ),
    chords: allChords.flatMap(chord => renderChord(chord, instrumentData)),
  };
  document.getElementsByClassName("chordPics")[0].innerHTML = chordsTemplate(
    chordData
  );
};

export const renderChords = function(): void {
  const data = songView.getData();
  const currentInstrument = songView.getInstrument();

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

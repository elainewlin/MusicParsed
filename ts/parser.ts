import $ from "jquery";
import "../css/convert.css";
import { SongData, SongLine } from "./model";
const clean = function(text: string): string {
  text = text.replace("[^A-Za-z0-9 ]+", "").toLowerCase();
  return text.replace(/ /g, "_");
};

const isLabel = function(line: string): boolean {
  if (!line) {
    return false;
  }
  // Checks whether a line is a label
  return (line.startsWith("[") && line.endsWith("]")) || line.endsWith(":");
};

const isChordLine = function(line: string): boolean {
  if(!line) {
    return false;
  }

  const pitch = "[A-G](?:bb|𝄫|b|♭|#|♯|x)?";
  const chordType = "(?:maj|m|aug|dim)?[0-9]*(?:(?:add|sus|no|bb|𝄫|b|♭|#|♯|x|𝄪)[0-9]+)*(?:/";
  // We use this when we override chord fingerings for ~fancy~ chords
  const fancyChordEnd = "(_[0-9]+)?$";
  const chord = `^${pitch}${chordType}${pitch})?${fancyChordEnd}`;
  const chordReg = new RegExp(chord, "g");
  const chordBoundary = new RegExp(/\S+/, "g");

  let isLineChord = true;

  line.replace(chordBoundary, function(word) {
    let wordIsChord = false;

    if (word.match(chordReg)) {
      wordIsChord = true;
    }
   
    isLineChord = isLineChord && wordIsChord;
    return "";
  });
  return isLineChord;
};

const isLyricLine = function(line: string): boolean {
  return !isLabel(line) && !isChordLine(line);
};

/**
 * Wrapper function for jQuery .val()
 */
const getVal = function(id: string): string {
  let val = $(`#${id}`).val();
  val = val ? val : "";
  return val.toString();
};

const getSongData = function(): SongData {
  const title = getVal("title");
  const artist = getVal("artist");

  const songLines: SongLine[] = [];
  const allChords: string[] = [];

  return {
    "title": title,
    "artist": artist,
    "fullName": `${title} - ${artist}`,
    "id": `${clean(title)} - ${clean(artist)}`,
    "lines": songLines,
    "allChords": allChords
  };
};

const parseLines = function(): SongData {  
  const data = getSongData();
  const updateAllChords = function(line: string): void {
    line.split(" ").map((chord: string) => {
      if(chord.includes("/")) {
        chord = chord.split("/")[0];
      }
      if(!data.allChords.includes(chord) && chord != "") {
        data.allChords.push(chord);
      }
    });
  };

  let lines = getVal("songText").split("\n");
  lines = lines.map((line) => line.trimRight()); 
  const iterator = lines[Symbol.iterator]();

  for (let line of iterator) {
    if (isLabel(line)) {
      data.lines.push({"label": line});
    } else if (isChordLine(line)) {
      for (;;) {
        let nextLine = iterator.next().value;
        let lyrics = "";
        if (isLyricLine(nextLine)) {
          lyrics = nextLine;
        }
        data.lines.push({"lyrics": lyrics, "chord": line});
        updateAllChords(line);

        line = nextLine;
        if (isLabel(line)) {
          data.lines.push({"label": line});
          break;
        } else if (!isChordLine(line)) {
          break;
        }
      }} else if (line) {
      data.lines.push({"lyrics": line, "chord": ""});
    }
  }

  return data;
};

$(document).ready(function() {
  $("#submit").click(function() {
    let data = parseLines();

    if (!data.artist || !data.title || !data.lines) {
      return;
    }

    $.ajax({
      url: "/addSong",
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      success:function(data) {
        alert(data.id);
      }
    });
  });

  $("#delete").click(function() {
    let data = parseLines();

    if (!data.artist || !data.title) {
      return;
    }

    $.post(`/deleteSong/${data.id}`, function(data) {
      alert(data);
    });
  });
});
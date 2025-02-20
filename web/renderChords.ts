import $ from "jquery";
import "bootstrap";
import { loadInstrumentButtons, loadOrientationButtons } from "./controller";
import { SongData } from "../lib/song";
import { renderChords, songView } from "./songView";
import "bootstrap/dist/css/bootstrap.css";
import "../css/styles.css";
import "../css/global.css";

$(document).ready(() => {
  songView.setInstrument("ukulele");
  loadInstrumentButtons({ showNone: false });
  loadOrientationButtons();

  const baseSong: SongData = {
    fullName: "",
    allChords: ["Am|2,0,0,3", "F", "C", "G"],
    lines: [],
    songId: "",
    title: "",
    artist: "",
    url: "",
  };
  songView.setSong(baseSong);
  songView.setChordOption("original");
  songView.setTranspose(0);
  renderChords();

  $("#renderChords").click(() => {
    const rawChordString = $("#chords").val() as string;
    if (!rawChordString) {
      return alert("No chords provided");
    }

    // Super basic parser
    // Removes white space and splits by semi-colon
    const allChords = rawChordString.replace(/ /g, "").split(";");
    baseSong.allChords = allChords;
    songView.setSong(baseSong);
    renderChords();
  });
});

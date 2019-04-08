import $ from "jquery";
import { loadInstrumentButtons, loadOrientationButtons } from "./controller";
import { renderChords, songView } from "./songView";
import "bootstrap/dist/css/bootstrap.css";
import "../css/styles.css";

$(document).ready(() => {
  songView.setInstrument("ukulele");
  loadInstrumentButtons({ showNone: false });
  loadOrientationButtons();
  songView.setSong({
    fullName: "",
    allChords: ["Am", "F", "C", "G"],
    lines: [],
  });
  songView.setChordOption("original");
  songView.setTranspose(0);
  renderChords();

  $("#renderChords").click(() => {
    const rawChordString = $("#chords").val() as string;

    // Super basic parser
    // Removes white space and splits by semi-colon
    const allChords = rawChordString.replace(/ /g, "").split(";");
    songView.setSong({ fullName: "", allChords: allChords, lines: [] });
    renderChords();
  });
});

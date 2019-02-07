import $ from "jquery";
import "bootstrap/js/dist/button";
import "jquery-ui/ui/widgets/tooltip";
import "jquery-ui/themes/base/all.css";
import { songView } from "./model.js";
import { renderChords, rerender } from "./render.js";
import buttonTemplate from "../mustache/button.mustache";

const TRANSPOSE = "transpose";
const COLUMN = "column";
const INSTRUMENT = "instrument";
const ORIENTATION = "orientation";
const CHORD_OPTION = "chord_option";

const getWidget = function(type) {
  return $(`#${type}`).find("input");
};

export const selectButton = function(type, value) {
  const buttonToSelect = $(`#${type}-${value}`);
  if (!buttonToSelect.find("input").prop("checked")) {
    $(`#${type}`).find("label").removeClass("active");
    buttonToSelect.addClass("active").find("input").prop("checked", true);
  }
};

const loadChordOptionButtons = function() {
  const chordOptions = ["original", "simple"];
  const chordOptionButtons = [];
  for (let value of chordOptions) {
    chordOptionButtons.push({
      type: CHORD_OPTION,
      name: value,
      value: value,
    });
  }
  document.getElementById(CHORD_OPTION).innerHTML = buttonTemplate({ buttons: chordOptionButtons });

  selectButton(CHORD_OPTION, songView.getChordOption());

  const chordOptionWidget = getWidget(CHORD_OPTION);

  chordOptionWidget.change(function(e) {
    songView.setChordOption(e.target.value);
    rerender();
  });
};

const loadTransposeButtons = function() {
  const transposeButtons = [];

  for (let value = -6; value <= 6; value++) {
    let name;
    if (value > 0) {
      name = `+${value}`;
    } else {
      name = value;
    }
    transposeButtons.push({
      type: TRANSPOSE,
      name: name,
      value: value
    });
  }
  document.getElementById(TRANSPOSE).innerHTML = buttonTemplate({ buttons: transposeButtons });

  renderTranspose();

  const transposeWidget = getWidget(TRANSPOSE);

  transposeWidget.change(function(e) {
    const transposeAmount = e.target.value;
    songView.setTranspose(transposeAmount);
    window.history.replaceState({"id": songView.getId(), "transpose": transposeAmount}, "", `?transpose=${transposeAmount}`);
    rerender();
  });
};

const renderColumnButtons = function() {
  const columnButtons = [];

  for (let value = 1; value <= 4; value++) {
    columnButtons.push({
      type: COLUMN,
      name: value,
      value: value,
    });
  }
  document.getElementById(COLUMN).innerHTML = buttonTemplate({ buttons: columnButtons });
};

const loadColumnButtons = function() {

  const updateColCount = function(colCount) {
    $("#song").css("column-count", colCount);
    $("#song").css("position", colCount > 1 ? "absolute" : "static");
  };
  let defaultColCount = 3;

  // Change default column count depending on screen width
  const width = $(window).width();
  // iPads
  if (width < 1200) {
    // phones
    defaultColCount = 2;
    if (width < 600) {
      defaultColCount = 1;
    }
  }

  renderColumnButtons();

  updateColCount(defaultColCount);
  selectButton(COLUMN, defaultColCount);

  const columnWidget = getWidget(COLUMN);

  columnWidget.change(function(e) {
    const colCount = e.target.value;
    updateColCount(colCount);
  });
};

export const loadInstrumentButtons = function(options={}) {
  // Render instrument toggle widget
  const instrumentOptions = ["none", "ukulele", "baritone", "guitar", "guitalele"];

  if(options.showNone === false) {
    instrumentOptions.shift();
  }
  const instrumentButtons = [];
  for (let value of instrumentOptions) {
    instrumentButtons.push({
      type: INSTRUMENT,
      name: value,
      value: value,
    });
  }
  document.getElementById(INSTRUMENT).innerHTML = buttonTemplate({ buttons: instrumentButtons });

  const currentInstrument = songView.getInstrument();
  selectButton(INSTRUMENT, currentInstrument);

  const instrumentWidget = getWidget(INSTRUMENT);

  instrumentWidget.change(function(e) {
    const newInstrument = e.target.value;
    songView.setInstrument(newInstrument);
    renderChords();
  });
};

export const loadOrientationButtons = function() {
  const orientationOptions = ["left", "right"];
  const orientationButtons = [];
  for (let value of orientationOptions) {
    orientationButtons.push({
      type: ORIENTATION,
      name: value,
      value: value,
    });
  }
  document.getElementById(ORIENTATION).innerHTML = buttonTemplate({ buttons: orientationButtons });

  selectButton(ORIENTATION, songView.getOrientation());

  const orientationWidget = getWidget(ORIENTATION);

  orientationWidget.change(function(e) {
    songView.setOrientation(e.target.value);
    renderChords();
  });
};

export var loadWidgets = function() {
  // Transpose widget
  loadTransposeButtons();

  // Column count widget
  loadColumnButtons();

  // Instrument toggle
  loadInstrumentButtons();

  // Toggle between original + simple chords
  loadChordOptionButtons();

  // Orientation toggle
  loadOrientationButtons();
};

export const renderTranspose = function() {
  const transpose = songView.getTranspose();
  selectButton(TRANSPOSE, transpose);
};


$(document).ready(function() {
  let hideableChordPics = $(".hideable");
  hideableChordPics.click(function() {
    songView.setInstrument("none");
    selectButton(INSTRUMENT, songView.getInstrument());
    renderChords();
  });
  hideableChordPics.tooltip();

  // Capo
  $("#capo").click(function() {
    const capo = songView.getCapo();
    songView.setTranspose(capo);
    rerender();
    $("#capo").hide();
  });

  // View widget, column, transpose widgets
  let viewToggle = $("#viewToggle");

  viewToggle.click(function() {
    const widgets = $("#widgets");
    widgets.toggle();

    if (widgets.is(":visible")) {
      viewToggle.text("hide");
    } else {
      viewToggle.text("show");
    }
  });
  viewToggle.tooltip();
});

// Copy and paste
document.addEventListener("copy", function(event) {
  const selection = document.getSelection();

  let mangle = false; // whether the selection contains chords
  const ranges = [];
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    const container = range.commonAncestorContainer.cloneNode(false);
    container.appendChild(range.cloneContents());
    const chords = container.querySelectorAll(".chords");
    if (chords.length) {
      mangle = true;
    }
    ranges.push({ range, container, chords });
  }
  if (!mangle) {
    return;
  }

  const containers = document.createElement("div");
  document.body.appendChild(containers);
  try {
    selection.removeAllRanges();

    for (const { container, chords } of ranges) {
      containers.appendChild(container);

      for (const chord of chords) {
        // Re-construct the old chord lyric implementation </3
        const parent = chord.parentNode;
        let fakeChordLine = parent.firstChild;
        if (
          !fakeChordLine.classList ||
          !fakeChordLine.classList.contains("fakeChordLine")
        ) {
          fakeChordLine = document.createElement("div");
          fakeChordLine.classList.add("fakeChordLine");
          parent.insertBefore(fakeChordLine, parent.firstChild);
        }

        const chordText = chord.textContent;
        const range = document.createRange();
        range.setStartAfter(fakeChordLine);
        range.setEndBefore(chord);
        let chords = fakeChordLine.textContent;
        if (chords) {
          chords += " ";
        }

        // Odd logic to account for odd character e.g. double sharp
        const chordPosition = [...range.toString()].length;
        fakeChordLine.textContent = chords.padEnd(chordPosition) + chordText;

        if (
          chord.firstChild.classList &&
          chord.firstChild.classList.contains("overLyric")
        ) {
          parent.removeChild(chord);
        } else {
          const chordLength = [...chordText].length;
          parent.replaceChild(
            document.createTextNode("".padEnd(chordLength)),
            chord
          );
        }
      }

      const range = document.createRange();
      range.selectNodeContents(container);
      selection.addRange(range);
    }

    event.clipboardData.setData("text/plain", selection.toString());
    event.preventDefault(); // No jarble here
  } finally {
    // Clean up DOM so we don't get abstract art
    document.body.removeChild(containers);
    selection.removeAllRanges();
    for (const { range } of ranges) {
      selection.addRange(range);
    }
  }
});
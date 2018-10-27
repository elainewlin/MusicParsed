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

const getWidget = function(type) {
  return $(`#${type}`).find("input");
};

const selectButton = function(type, value) {
  $(`#${type}`).find("label").removeClass("active");
  $(`#${type}-${value}`).addClass("active").find("input").prop("checked", true);
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

  const transpose = songView.getTranspose();
  selectButton(TRANSPOSE, transpose);

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

  // Orientation toggle
  loadOrientationButtons();
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
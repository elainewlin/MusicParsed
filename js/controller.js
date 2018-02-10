import $ from "jquery";
import "bootstrap/js/button";
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

  $("#transpose").find("input").change(function(e) {
    songView.setTranspose(e.target.value);
    window.history.pushState({}, "", `?transpose=${e.target.value}`);
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

export const loadInstrumentButtons = function() {
  // Render instrument toggle widget
  const instrumentOptions = ["none", "ukulele", "baritone", "guitar", "guitalele"];
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

export const renderTranspose = function() {
  const transpose = songView.getTranspose();
  selectButton(TRANSPOSE, transpose);
};


$(document).ready(function() {
  let chordPics = $(".chordPics");
  chordPics.click(function() {
    songView.setInstrument("none");
    selectButton(INSTRUMENT, songView.getInstrument());
    renderChords();
  });
  chordPics.tooltip();

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
import $ from "jquery";
import "bootstrap/js/button";
import "jquery-ui/ui/widgets/tooltip";
import "jquery-ui/themes/base/all.css";
import { songView } from "./model.js";
import { renderChords, rerender } from "./render.js";
import buttonTemplate from "../mustache/button.mustache";

const transpose = "transpose";
const column = "column";
const instrument = "instrument";

const getWidget = function(type) {
  return $("#" + type + " > .btn-group");
}

const selectButton = function(type, value) {
  $(`#${type}`).find("label").removeClass("active");
  $(`#${type}-${value}`).addClass("active").find("input").prop("checked", true);
}

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
      type: transpose,
      name: name,
      value: value
    })
  }
  document.getElementById(transpose).innerHTML = buttonTemplate({ buttons: transposeButtons });

  selectButton(transpose, 0);

  $("#transpose").find("input").change(function(e) {
    const newKey = e.target.value;
    songView.setKey(newKey);
    rerender();
  });
}

const loadColumnButtons = function() {

  const updateColCount = function(colCount) {
    $("#song").css("column-count", colCount);
  }

  let defaultColCount = 3;
  // Change default column count depending on screen width
  const width = $(window).width();

  // iPads and phones
  if (width < 1200) {
    defaultColCount = 2;
  }

  const columnButtons = [];

  for (let value = 1; value <= 4; value++) {
    columnButtons.push({
      type: column,
      name: value,
      value: value,
    })
  }
  document.getElementById(column).innerHTML = buttonTemplate({ buttons: columnButtons });

  updateColCount(defaultColCount);
  selectButton(column, defaultColCount);

  const columnWidget = getWidget(column);

  columnWidget.find("input").change(function(e) {
    const colCount = e.target.value;
    updateColCount(colCount);
  });
}

const loadInstrumentButtons = function() {
  // Render instrument toggle widget
  const instrumentOptions = ['none', 'ukulele', 'baritone', 'guitar', 'guitalele'];
  const instrumentButtons = [];
  for (let value of instrumentOptions) {
    instrumentButtons.push({
      type: instrument,
      name: value,
      value: value,
    })
  }
  document.getElementById(instrument).innerHTML = buttonTemplate({ buttons: instrumentButtons });

  const currentInstrument = songView.getInstrument();
  selectButton(instrument, currentInstrument);

  const instrumentWidget = getWidget(instrument);

  $("#instrument").find("input").change(function(e) {
    const newInstrument = e.target.value;
    songView.setInstrument(newInstrument);
    renderChords();
  });
}

export var loadWidgets = function() {
  // Transpose widget
  loadTransposeButtons();

  // Column count widget
  loadColumnButtons();

  // Instrument toggle
  loadInstrumentButtons();
}

export var setTranspose = function(key) {
  songView.setKey(key);
  selectButton(transpose, key);
};

$(document).ready(function() {
  let chordPics = $("#chordPics");
  chordPics.click(function() {
    songView.setInstrument('none');
    selectButton(instrument, 'none');
    renderChords();
  });
  chordPics.tooltip();

  function getToggler(elementToToggle, textToUpdate) {
    return function() {
      elementToToggle.toggle()

      if (elementToToggle.is(":visible")) {
        textToUpdate.text("hide");
      } else {
        textToUpdate.text("show");
      }
    }
  }

  // Capo
  $("#capo").click(function() {
    const capo = songView.getCapo();
    setTranspose(capo);
    rerender();
    $("#capo").hide();
  })

  // View widget, column, transpose widgets
  let viewToggle = $("#viewToggle");
  const toggleWidgets = getToggler($("#widgets"), viewToggle);

  viewToggle.click(function() {
    toggleWidgets();
  });
  viewToggle.tooltip();

});
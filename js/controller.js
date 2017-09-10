import $ from "jquery";
import "jquery-ui/ui/widgets/tooltip";
import Mustache from "mustache";
import {songView} from "./model.js";
import {renderChords, rerender} from "./render.js";

const transpose = "transpose";
const column = "column";
const instrument = "instrument";

const getWidget = function(type) {
  return $("#"+type+" > .btn-group");
}
const buttonTemplate = document.getElementById('buttonTemplate').innerHTML;

const selectButton = function(type, value) {
  $(`#${type}`).find("label").removeClass("selected");
  $(`#${type}-${value}`).addClass('selected');
}

const loadTransposeButtons = function() {
  const transposeButtons = [];

  for(let value = -6; value <= 6; value++) {
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
  document.getElementById(transpose).innerHTML = Mustache.render(buttonTemplate, transposeButtons);

  selectButton(transpose, 0);

  $("#transpose").find("input").click(function(e) {
    var newKey = $(e.target.parentNode).data()[transpose];
    selectButton(transpose, newKey);
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

  for(let value = 1; value <= 4; value++) {
    columnButtons.push({
      type: column,
      name: value,
      value: value,
    })
  }
  document.getElementById(column).innerHTML = Mustache.render(buttonTemplate, columnButtons);

  updateColCount(defaultColCount);
  selectButton(column, defaultColCount);

  const columnWidget = getWidget(column);

  columnWidget.find("input").click(function(e) {
    const colCount = $(e.target.parentNode).data()[column];
    selectButton(column, colCount);
    updateColCount(colCount);
  });
}

const loadInstrumentButtons = function() {
  // Render instrument toggle widget
  const instrumentOptions = ['none', 'ukulele', 'guitar', 'guitalele'];
  const instrumentButtons = [];
  for (let value of instrumentOptions) {
    instrumentButtons.push({
      type: instrument,
      name: value,
      value: value,
    })
  }
  document.getElementById(instrument).innerHTML = Mustache.render(buttonTemplate, instrumentButtons);

  const currentInstrument = songView.getInstrument();
  selectButton(instrument, currentInstrument);

  const instrumentWidget = getWidget(instrument);

  $("#instrument").find("input").click(function(e) {
    const newInstrument = $(e.target.parentNode).data()[instrument];

    selectButton(instrument, newInstrument);
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

export var resetTranspose = function() {
  const key = 0;
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

        if(elementToToggle.is(":visible")) {
          textToUpdate.text("hide");
        }
        else {
          textToUpdate.text("show");
        }
      }
    }

    // View widget, column, transpose widgets
    let viewToggle = $("#viewToggle");
    const toggleWidgets = getToggler($("#widgets"), viewToggle);

    viewToggle.click(function() {
      toggleWidgets();
    });
    viewToggle.tooltip();

});
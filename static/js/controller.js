// TO DO Refactor this code
const transpose = "transpose";
const column = "column";
const instrument = "instrument";

const getWidget = function(type) {
  return $("#"+type+" > .btn-group");
}

const getButton = function(type, value) {
  let name; // text displayed in button
  let data; // used in HTML data-=

  if (type == transpose) {
      if(value > 0) {
        name = `+${value}`;
      }
      else {
        name = value;
      }
  }
  if (type == column) {
      name = value;
  }
  if (type == instrument) {
    name = value;
  }
  return (`<label class='btn btn-default' data-${type}='${value}' id='${type}-${value}'><input type='radio'> ${name}</label>`);
}

const selectButton = function(type, value) {
  $(`#${type}-${value}`).addClass('selected');
}

const loadTransposeButtons = function() {
  const transposeWidget = getWidget(transpose);
  for(let i = -6; i <= 6; i++) {
    const button = getButton(transpose, i);
    transposeWidget.append(button);
  }
  selectButton(transpose, 0);

  transposeWidget.find("input").click(function(e) {
    var newKey = $(e.target.parentNode).data()[transpose];
    songView.setKey(newKey);
    rerender(songView.getData());
  });
}

const updateColCount = function(colCount) {
  $("#song").css("column-count", colCount);
}

const loadColumnButtons = function() {
  const columnWidget = getWidget(column);

  let defaultColCount = 3;
  // Change default column count depending on screen width
  const width = $(window).width();

  // iPads and phones
  if (width < 1200) {
    defaultColCount = 2;
  }

  for(let i = 1; i <= 4; i++) {
    const button = getButton(column, i);
    columnWidget.append(button);
  }
  updateColCount(defaultColCount);
  selectButton(column, defaultColCount);

  columnWidget.find("input").click(function(e) {
    var colCount = $(e.target.parentNode).data()[column];
    updateColCount(colCount);
  });
}

const loadInstrumentButtons = function() {

  // Render instrument toggle widget
  const instrumentWidget = getWidget(instrument);

  const instrumentOptions = ['ukulele', 'guitar'];
  for (let option of instrumentOptions) {
    const button = getButton(instrument, option);
    instrumentWidget.append(button);
  }
  const currentInstrument = songView.getInstrument();
  selectButton(instrument, currentInstrument);

  instrumentWidget.find("input").click(function(e) {
    var newInstrument = $(e.target.parentNode).data()[instrument];
    songView.setInstrument(newInstrument);
    renderChords(songView.getData());
  });
}

var loadWidgets = function() {
  // Transpose widget
  loadTransposeButtons();

  // Column count widget
  loadColumnButtons();

  // Instrument toggle
  loadInstrumentButtons();

  // Adjusting selected radio button
  $("input[type=radio]").click(function(e) {
      var labels = $(e.target.parentNode.parentNode).find("label");
      labels.removeClass("selected");
      var target = $(e.target.parentNode);
      target.addClass("selected");
  });
}

var resetTranspose = function() {
  const key = 0;
  songView.setKey(key);
  $("#transpose").find("label").removeClass("selected");
  selectButton(transpose, key);
};

$(document).ready(function() {
    // Chord toggle widgets
    let chordPics = $("#chordPics");
    let chordToggle = $("#chordToggle");
  
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
    const toggleChords = getToggler(chordPics, chordToggle);
    chordToggle.click(function() {
      toggleChords();
    });

    chordPics.click(function() {
      toggleChords();
    });
    chordPics.tooltip();

    // View widget, column, transpose widgets
    let viewToggle = $("#viewToggle");
    const toggleWidgets = getToggler($("#widgets"), viewToggle);

    viewToggle.click(function() {
      toggleWidgets();
    });
    viewToggle.tooltip();

});
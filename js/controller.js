// TO DO Refactor this code
function updateColCount(colCount) {
    $("#song").css("column-count", colCount);
}

var loadWidgets = function() {
  // Load the columns toggle and transpose toggle widgets

  // Wrapper for all of the smaller radio buttons
  // type = transpose, column-count

  const transpose = "transpose";
  const column = "column-count";

  const getWidget = function(type) {
    return $("#"+type+" > .btn-group");
  }

  const getButton = function(type, value) {
    let name; // number displayed in button
    let data; // used in HTML data-=

    if (type == transpose) {
        if(value > 0) {
          name = `+${value}`;
        }
        else {
          name = value;
        }
        data = 'key';
    }
    if (type == column) {
        name = value;
        data = 'column';
        type = 'column';
    }
    return (`<label class='btn btn-default' data-${data}=${value} id='${type}-${value}'><input type='radio'> ${name}</label>`);
  }

  const transposeWidget = getWidget(transpose);
  for(let i = -6; i <= 6; i++) {
    const button = getButton(transpose, i);
    transposeWidget.append(button);
  }

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
  $(`#column-${defaultColCount}`).addClass("selected");
}

var resetTranspose = function() {
  const key = 0;
  songView.setKey(key);
  $("#transpose").find("label").removeClass("selected");
  $(`#transpose-${key}`).addClass("selected");
};

$(document).ready(function() {
    // Chord toggle widgets
    let chordPics = $("#chordPics");
    function toggleChords() {
        chordPics.toggle();

        if(chordPics.is(":visible")) {
            $("#chordToggle").text("hide");
        }
        else {
            $("#chordToggle").text("show");
        }
    }

    $("#chordToggle").click(function() {
       toggleChords();
    });

    chordPics.click(function() {
        toggleChords();
    });
    chordPics.tooltip();

    $("#instrumentToggle").click(function() {
        songView.toggleInstrument();
        renderChords(songView.getData());
    });

    // View widget, column, transpose widgets
    let viewToggle = $("#viewToggle");
    viewToggle.click(function() {
        $("#column-count").toggle();
        $("#transpose").toggle();
    });
    viewToggle.tooltip();

    $("#column-count").find("input").click(function(e) {
        var colCount = $(e.target.parentNode).data()["column"];
        updateColCount(colCount);
    });

    // View for transpose and column widgets
    $("input[type=radio]").click(function(e) {
        var labels = $(e.target.parentNode.parentNode).find("label");
        labels.removeClass("selected");
        var target = $(e.target.parentNode);
        target.addClass("selected");
    });

    $("#transpose").find("input").click(function(e) {
        var newKey = $(e.target.parentNode).data()["key"];
        songView.setKey(newKey);
        rerender(songView.getData());
    });
});
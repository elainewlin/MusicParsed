// TO DO Refactor this code
function updateColCount(colCount) {
    $("#song").css("column-count", colCount);
}

var loadWidgets = function() {
  // Load the columns toggle and transpose toggle widgets
  const getButtons = function(type) {
    return $("#"+type+" > .btn-group");
  }

  const transposeButtons = getButtons("transpose");
  for(let i = -6; i <= 6; i++) {
    let name;
    if(i > 0) {
      name = `+${i}`;
    }
    else {
      name = i;
    }
    transposeButtons.append(`<label class='btn btn-default' data-key=${i} id='transpose-${i}'><input type='radio'> ${name}</label>`);
  }

  const columnButtons = getButtons("column-count");

  let defaultColCount = 3;
  // Change default column count depending on screen width
  const width = $(window).width();

  // iPads and phones
  if (width < 1200) {
    defaultColCount = 2;
  }

  updateColCount(defaultColCount);
  for(let i = 1; i <= 4; i++) {
    columnButtons.append(`<label class='btn btn-default' data-column=${i} id='column-${i}'><input type='radio'> ${i}</label>`);
    $(`#column-${defaultColCount}`).addClass("selected");
  }
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
var renderChords = function(data) {
  var currentInstrument = songView.getInstrument();
  $("#instrumentToggle").text(currentInstrument);

  var chordTemplate = document.getElementById("chordTemplate").innerHTML;

  document.getElementById('chordPics').innerHTML = Mustache.render(chordTemplate, data);
};

var rerender = function(data) {
  $("#title").text(songView.getName());

  var songTemplate = document.getElementById('songTemplate').innerHTML;
  document.getElementById('song').innerHTML = Mustache.render(songTemplate, data);

  renderChords(data);
};

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
  for(let i = 1; i <= 4; i++) {
    columnButtons.append(`<label class='btn btn-default' data-column=${i} id='column-${i}'><input type='radio'> ${i}</label>`);
    $('#column-3').addClass("selected");
  }
}

var resetTranspose = function() {
  songView.setKey(0);
  $("#transpose").find("label").removeClass("selected");
  $("#transpose-0").addClass("selected");
};

var loadSong = function(newSong) {
  songView.setName(newSong);

  $.getJSON("./template/json/"+newSong+".json", function(data) {
      songView.setSong(data);
      resetTranspose();
      rerender(songView.getData());
  });
};

window.onload = function() {
  loadWidgets();

  var song = localStorage.getItem("song");
  if (song) {
    loadSong(song);
  }
  else {
    // Default song
    loadSong(songView.getName());
  }

  $("#tags").autocomplete({
      source: function(request, response) {
         $.ajax({
          url: "./template/allSongs.json",
          dataType: "json",
          data: {
            term: request.term
          },
          success: function(data) {
            var re = $.ui.autocomplete.escapeRegex(request.term);
            var matcher = new RegExp( re, "i" );
            var matches = $.grep(data, function(item){
              return matcher.test(item["id"]); // searching by song ID
            });
            response(matches);
          }
        });
      },
      select: function(event, ui) {
        var newSong = ui.item.value;
        loadSong(newSong);
      }
  });

};
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

var loadSong = function(newSong) {

  $.getJSON("/static/data/json/"+newSong+".json", function(data) {
      songView.setName(`${data.title} - ${data.artist}`);
      songView.setSong(data);
      resetTranspose();
      rerender(songView.getData());
  });
};

window.onload = function() {
  loadWidgets();

  $("#tags").autocomplete({
      source: function(request, response) {
         $.ajax({
          url: "/static/data/allSongs.json",
          dataType: "json",
          data: {
            term: request.term
          },
          success: function(data) {
            var re = $.ui.autocomplete.escapeRegex(request.term);
            var matcher = new RegExp( re, "i" );
            var matches = $.grep(data, function(item){
              return matcher.test(item["value"]); // searching by song ID
            });
            response(matches);
          }
        });
      },
      select: function(event, ui) {
        var newSong = ui.item.id;
        window.history.pushState({'song': newSong}, ui.item.value, `/song/${ui.item.id_artist}/${ui.item.id_title}`)
        loadSong(newSong);
      }
  });

};
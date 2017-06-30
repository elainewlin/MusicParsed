var renderChords = function(data) {
  var currentInstrument = songView.getInstrument();
  $("#instrumentToggle").text(currentInstrument);

  var chordTemplate = document.getElementById("chordTemplate").innerHTML;

  document.getElementById('chordPics').innerHTML = Mustache.render(chordTemplate, data);
}

var rerender = function(data) {
  $("#title").text(songView.getName());

  var songTemplate = document.getElementById('songTemplate').innerHTML;
  document.getElementById('song').innerHTML = Mustache.render(songTemplate, data);
  
  renderChords(data);
}

var resetTranspose = function() {
  songView.setKey(0);
  $("#transpose").find("label").removeClass("selected");
  $("#0").addClass("selected");
}

var loadSong = function(newSong) {
  songView.setName(newSong);
  
  $.getJSON("./template/json/"+newSong+".json", function(data) {
      songView.setSong(data);
      resetTranspose();
      rerender(songView.getData());
  });
}

window.onload = function() {

  // Default song songView.getName()
  var song = localStorage.getItem("song");
  loadSong(song);

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
            console.log(matches);
            response(matches);
          }
        });
      },
      select: function(event, ui) { 
        var newSong = ui.item.value;
        loadSong(newSong);
      }
  }); 

}
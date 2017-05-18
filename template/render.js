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

var showAllSongs = function() {
  var allSongs = {}

  // TO-DO figure out how to organize allSongs.json
  // TO-DO figure out how to sort by artist or tags
  $.ajax({
    url: "./template/allSongs.json",
    dataType: "json",
    success: function(data) {
      data.map(function(song) {

        // Sorting by artist
        var parts = song.split(' - ');
        var title = parts[0];
        var artist = parts[1];

        if(allSongs.hasOwnProperty(artist)) {
          allSongs[artist].push(title);
        }
        else {
          allSongs[artist] = [title];
        }
      });

      var asdf = []
      for(var i in allSongs) {
        var temp = {}
        temp["artist"] = i;
        temp["songs"] = allSongs[i];
        asdf.push(temp);
      }
     
       //Grab the inline template
      var template = document.getElementById('allSongsTemplate').innerHTML;

      //Overwrite the contents of song with the rendered HTML
      $('#allSongs').show();
      document.getElementById('allSongs').innerHTML = Mustache.render(template, asdf);

      $(".songTitle").click(function(e) {
        var newSong = $(e.target).data()["id"];
        loadSong(newSong);
        $('#allSongs').hide();
      })
    }
  });
}

window.onload = function() {

  // Default song
  loadSong(songView.getName());

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
            var matches = $.grep(data, function(item){return matcher.test(item);});
            response(matches);
          }
        });
      },
      select: function(event, ui) { 
        var newSong = ui.item.label;
        loadSong(newSong);
      }
  }); 

}
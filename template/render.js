var renderChords = function() {
  $("#instrumentToggle").text(songView.currentInstrument);

  var chordTemplate = document.getElementById("chordTemplate").innerHTML;

  var data = {};
  data["currentInstrument"] = songView.currentInstrument;
  data["allChords"] = songView["allChords"].sort().map(function(chord) {
    return chord.replace("#", "%23");
  });

  document.getElementById('chordPics').innerHTML = Mustache.render(chordTemplate, data);
}

var rerender = function() {
  //Grab the inline template
  var songTemplate = document.getElementById('songTemplate').innerHTML;
  var titleTemplate = document.getElementById('titleTemplate').innerHTML;

  //Overwrite the contents of song with the rendered HTML
  document.getElementById('song').innerHTML = Mustache.render(songTemplate, songView);
  document.getElementById('title').innerHTML = Mustache.render(titleTemplate, songView);
  
  renderChords();

  // Update view for transpose widget
  // $("#transpose").find("label").removeClass("selected");
  // $("#0").addClass("selected");
}


var loadSong = function(newSong) {
  songView["songName"] = newSong;

  $.getJSON("./template/json/"+newSong+".json", function(data) {
      songView["allChords"] = data["allChords"];
      songView["lines"] = data["lines"];
      rerender();
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
  loadSong(songView["songName"]);

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
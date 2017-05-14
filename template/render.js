var renderChords = function(data) {
  var chordTemplate = document.getElementById('chordTemplate').innerHTML;
  document.getElementById('chordPics').innerHTML = Mustache.render(chordTemplate, data);
  $("#instrumentToggle").text(data["instrument"]);
  $("#song").data()["instrument"] = data["instrument"];
}

var rerender = function(data) {
  //Grab the inline template
  var songTemplate = document.getElementById('songTemplate').innerHTML;
  var titleTemplate = document.getElementById('titleTemplate').innerHTML;
  
  //Overwrite the contents of song with the rendered HTML
  document.getElementById('song').innerHTML = Mustache.render(songTemplate, data);
  document.getElementById('title').innerHTML = Mustache.render(titleTemplate, data);
  $("#song").data()["allChords"] = data["allChords"];
  data["instrument"] = $("#song").data()["instrument"];
  renderChords(data);
}

window.onload = function() {
  var defaultSong = "Viva la Vida - Coldplay";
  $.getJSON("./template/json/"+defaultSong+".json", function(data) {
      rerender(data);
  });

  $("#tags").autocomplete({
      // TO-DO use some server side script ex: php
      // problem: only shows songs that start with the letter
      // problem: inefficient regex script
      source: function(request, response) {
         $.ajax({
          url: "./template/allSongs.json",
          dataType: "json",
          data: {
            term: request.term
          },
          success: function(data) {
            var re = $.ui.autocomplete.escapeRegex(request.term);
            var matcher = new RegExp( "^" + re, "i" );
            var matches = $.grep(data, function(item){return matcher.test(item);});
            response(matches);
          }
        });
      },
      select: function(event, ui) { 
        $.getJSON("./template/json/"+ui.item.label+".json", function(data) {
          rerender(data);
        });
      }
  }); 

}
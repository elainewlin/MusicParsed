var renderChords = function(data) {
  var chordTemplate = document.getElementById('chordTemplate').innerHTML;
  Mustache.parse(chordTemplate);
  document.getElementById('chordPics').innerHTML = Mustache.render(chordTemplate, data);
  $("#instrumentToggle").text(data["instrument"]);
  $("#song").data()["instrument"] = data["instrument"];
}

var rerender = function(data) {
  //Grab the inline template
  var template = document.getElementById('template').innerHTML;
  //Parse it (optional, only necessary if template is to be used again)
  Mustache.parse(template);
  //Overwrite the contents of song with the rendered HTML
  document.getElementById('song').innerHTML = Mustache.render(template, data);
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
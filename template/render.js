window.onload = function() {
  //Grab the inline template
  var template = document.getElementById('template').innerHTML;
  var chordTemplate = document.getElementById('chordTemplate').innerHTML;

  //Parse it (optional, only necessary if template is to be used again)
  Mustache.parse(template);
  Mustache.parse(chordTemplate);

  var allSongs = ["Set Fire to the Rain - Adele", "Love Story - Taylor Swift", "Monster - Imagine Dragons", "Wonderwall - Oasis"];

  $("#tags").autocomplete({
    source: allSongs,
     select: function(event, ui) { 
      var file = ui.item.label + ".json";
      $.getJSON("/template/json/"+file, function(data) {

        //Overwrite the contents of song with the rendered HTML
        document.getElementById('song').innerHTML = Mustache.render(template, data);
        document.getElementById('chordPics').innerHTML = Mustache.render(chordTemplate, data);
      });
    }
  }); 
 
}
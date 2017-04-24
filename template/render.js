window.onload = function() {
  //Grab the inline template
  var template = document.getElementById('template').innerHTML;

  //Parse it (optional, only necessary if template is to be used again)
  Mustache.parse(template);

  var allSongs = ["Set Fire to the Rain - Adele", "Love Story - Taylor Swift", "Monster - Imagine Dragons", "Wonderwall - Oasis"];

  $("#tags").autocomplete({
    source: allSongs,
     select: function(event, ui) { 
      var file = ui.item.label + ".json";
      $.getJSON("/template/json/"+file, function(data) {

        //Render the data into the template
        var rendered = Mustache.render(template, data);

        //Overwrite the contents of #target with the rendered HTML
        document.getElementById('song').innerHTML = rendered;
      });
    }
  }); 
 
}
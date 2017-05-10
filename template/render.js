var rerender = function(data) {
  
  //Grab the inline template
  var template = document.getElementById('template').innerHTML;
  var chordTemplate = document.getElementById('chordTemplate').innerHTML;
  //Parse it (optional, only necessary if template is to be used again)
  Mustache.parse(template);
  Mustache.parse(chordTemplate);

  //Overwrite the contents of song with the rendered HTML
  document.getElementById('song').innerHTML = Mustache.render(template, data);
  document.getElementById('chordPics').innerHTML = Mustache.render(chordTemplate, data);

}
window.onload = function() {
 
  // var allSongs = ["Love Story - Taylor Swift", "Yellow Submarine - The Beatles"]; 
  $("#tags").autocomplete({
     source: "/template/allSongs.json",
     // source: ["Be Wherever You Are - Steven Universe", "Both of You - Steven Universe", "Love Story - Taylor Swift", "Shine Like Rainbows - Daniel Ingram", "Tricks Up My Sleeve - Daniel Ingram", "Viva la Vida - Coldplay", "Yellow Submarine - The Beatles"], //
     select: function(event, ui) { 
      $.getJSON("/template/json/"+ui.item.label+".json", function(data) {
        rerender(data);
      });
    }
  }); 

}
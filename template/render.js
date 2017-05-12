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
  var defaultSong = "Viva la Vida - Coldplay";
  $.getJSON("./template/json/"+defaultSong+".json", function(data) {
      rerender(data);
  });
  $("#tags").autocomplete({
    source: ["A Little of Your Time - Maroon 5", "Amaranth - Nightwish", "Be Wherever You Are - Steven Universe", "Both of You - Steven Universe", "Bottle It Up - Sara Bareilles", "Boulevard Of Broken Dreams - Green Day", "But Its Better If You Do  - Panic! At the Disco", "Chandelier - Sia", "Cheap Thrills - Sia", "Clocks - Coldplay", "Dani California  - Red Hot Chili Peppers", "Destiny - Steven Universe", "Dirty Little Secret - The All-American Rejects", "Do It For Her - Steven Universe", "Do You Want To Build A Snowman - Disney", "Elan - Nightwish", "Fairytale - Sara Bareilles", "Fluorescent Adolescent  - Arctic Monkeys", "Full Disclosure - Steven Univrse", "Giant Woman - Steven Universe", "Gravity - Sara Bareilles", "Hallelujah - Panic! At the Disco", "Haven't You Noticed I'm a Star - Steven Universe", "Here Comes a Thought - Steven Universe", "Hymn For The Weekend - Coldplay", "I Choose You - Sara Bareilles", "I Won't Say I'm In Love  - Disney", "I'll Make A Man Out Of You - Disney", "I'm Just Your Problem - Adventure Time", "It's Over Isn't It - Steven Universe", "Jam Buddies - Steven Universe", "Jumper - Third Eye Blind", "Lapis Lazuli - Steven Universe", "Leave Out All The Rest - Linkin Park", "Let It Go - Disney", "Love Is An Open Door - Disney", "Love Song - Sara Bareilles", "Love Story - Taylor Swift", "Makes Me Wonder - Maroon 5", "Misery - Maroon 5", "Nemo - Nightwish", "Nothing Lasts Forever - Maroon 5", "One Sweet Love - Sara Bareilles", "Payphone - Maroon 5", "Peace and Love - Steven Universe", "R U Mine - Arctic Monkeys", "Semi Charmed Life - Third Eye Blind", "Shadow Of The Day - Linkin Park", "She Will Be Loved - Maroon 5", "Shine Like Rainbows - Daniel Ingram", "Still Alive - Portal", "Sunday Morning - Maroon 5", "Sweetest Goodbye - Maroon 5", "The Scientist - Coldplay", "The Sun - Maroon 5", "The Zephyr Song - Red Hot Chili Peppers", "This Love - Maroon 5", "Tricks Up My Sleeve - Daniel Ingram", "Viva la Vida - Coldplay", "Wildest Dreams - Taylor Swift", "Yellow Submarine - The Beatles", "You Belong With Me - Taylor Swift"],
     // source: "./template/allSongs.json", //TO-DO get autocomplete feature working
     // source: ["Be Wherever You Are - Steven Universe", "Both of You - Steven Universe", "Love Story - Taylor Swift", "Shine Like Rainbows - Daniel Ingram", "Tricks Up My Sleeve - Daniel Ingram", "Viva la Vida - Coldplay", "Yellow Submarine - The Beatles"], //
     select: function(event, ui) { 
      $.getJSON("./template/json/"+ui.item.label+".json", function(data) {
        rerender(data);
      });
    }
  }); 

}
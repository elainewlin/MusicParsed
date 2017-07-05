
window.onload = function() {
  var allSongs = {}

  // TO DO figure out how to sort by artist or tags
  $.ajax({
    url: "./template/allSongs.json",
    dataType: "json",
    success: function(data) {
      data.map(function(song) {

        // Sorting by artist
        var id = song["id"];
        var title = song["title"];
        var artist = song["artist"];

        if(allSongs.hasOwnProperty(artist)) {
          allSongs[artist].push(song);
        }
        else {
          allSongs[artist] = [song];
        }
      });

      var sorted = []
      for(var tag in allSongs) {
        sorted.push({"tag": tag, "songs": allSongs[tag]});
      }
	  
	  sorted = sorted.sort(function(a, b){
		var nameA=a.tag, nameB=b.tag;
		if (nameA < nameB) //sort string ascending
			return -1;
		if (nameA > nameB)
			return 1;
		return 0; //default return value (no sorting)
	  });
     
      var template = document.getElementById('allSongsTemplate').innerHTML;
      document.getElementById('allSongs').innerHTML = Mustache.render(template, sorted);

      $(".songTitle").click(function(e) {
        var newSong = $(e.target).data()["id"];
        localStorage.setItem("song", newSong);
      })
    }
  });
}
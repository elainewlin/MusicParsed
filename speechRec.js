var current = 1;
var lyrics; //lyrics of the next line

$(document).ready(function() {
  // TODO: have the lyrics be separated into separate divs of different lines
  // or in a table somewhere? and set lyrics = to that line of lyrics?

  var getLyric = function(id) { 
    id = id.toString();
    return $("#"+id+"> span");
  }
  lyrics = getLyric(current+1)[0].textContent;

  var increment = function(newID) { 
    getLyric(current).css("backgroundColor", "#ffffff");
    current = newID;
    getLyric(current).css("backgroundColor", "#ffffcc");
    lyrics = getLyric(current+1)[0].textContent;
  }

  $(".line").click(function(e) {
    var id = e.currentTarget.id;
    increment(parseInt(id));
  });

  // highlight first line
  getLyric(current).css("backgroundColor", "#ffffcc");

  var final_span = document.getElementById('final_span');
  var interim_span = document.getElementById('interim_span');

  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
  }

  recognition.onresult = function(event) {
    var interim_transcript = '';
    var final_transcript = '';
    var processed_line = false;
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal)
        final_transcript += event.results[i][0].transcript;
      else
        interim_transcript += event.results[i][0].transcript;
    }
   
    final_span.innerHTML = final_transcript;
    interim_span.innerHTML = interim_transcript;
    if (userSaidPhrase(lyrics, final_transcript)) {
      smoothScroll(1);
      increment(current+1);
      processed_line = true;
    }

    //temporary check; TODO: determine when a line has been matched
    else if (interim_transcript.trim().split(' ').length === 5) {
      processed_line = true;
    }

    // If scrolled (reacted to speech), kill recognition and restart
    if (processed_line) {
      recognition.stop();
    }
  };

  // TODO: figure out how much timeout is actually needed
  // Restart recognition if it has stopped
  recognition.onend = function(event) {
    setTimeout(function() {
      recognition.start();
    }, 1000);
  };

  recognition.start();
});

// TODO: implement a 'fuzzy' matching of transcript to string
var userSaidPhrase = function(line, commands) {
  var line = line.toLowerCase().trim().split(" "); // array of all words in the line
  var lowerCase = commands.toLowerCase().trim();

  var wordsSaid = 0;
  for(var i in line) {
    if (lowerCase.includes(line[i])) { 
      wordsSaid += 1;
    }
  }  

  var cutoff = 2;

  if(wordsSaid >= cutoff) {
    return true;
  }
  return false;
}

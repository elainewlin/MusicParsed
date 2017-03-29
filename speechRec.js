$(document).ready(function() {
  // TODO: have the lyrics be separated into separate divs of different lines
  // or in a table somewhere? and set lyrics = to that line of lyrics?
  var lyrics = "please";

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
var userSaidPhrase = function(str, commands) {
  var lowerStr = str.toLowerCase();
  var lowerCase = commands.toLowerCase().trim();
  if (lowerCase.includes(lowerStr)) {
    return true;
  }
  return false;
}

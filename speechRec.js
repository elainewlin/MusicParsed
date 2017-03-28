// TODO: have the lyrics be separated into separate divs of different lines
// or in a table somewhere? and set lyrics = to that line of lyrics?
var lyrics = "please";

// TODO: implement a 'fuzzy' matching of transcript to string
var userSaidPhrase = function(str, commands) {
  var lowerStr = str.toLowerCase();
  var lowerCase = commands.toLowerCase().trim();
  if (lowerCase.includes(lowerStr)) {
    return true;
  }
  return false;
}

var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

recognition.onresult = function(event) {
  var transcript = '';
  var hasFinal = false;
  var processed = false;
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal)
      hasFinal = true;
    else
      transcript += event.results[i][0].transcript;
  }

  if (userSaidPhrase(lyrics, transcript)) {
    smoothScroll(1);
    processed = true;
  }

  // If scrolled (reacted to speech), kill recognition and restart
  if (processed) {
    recognition.stop();
  }
};

// TODO: figure out how much timeout is actually needed
// Restart recognition if it has stopped
recognition.onend = function(event) {
  recognizing = false;
  setTimeout(function() {
    recognition.start();
  }, 1000);
};

recognition.start();
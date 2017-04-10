$(document).ready(function() {
  var currentLine = 1;
  var nExpectedTransitions = getChordLength(currentLine) - 1;
  var nActualTransitions = 0;

  function initSuccess() {
    DiffCamEngine.start();
  }

  function initError() {
    alert('Something went wrong.');
  }

  function getChordLength(current) {
    var chords = $("#" + current+" > pre").text().split(" ");
    chords = chords.filter(function(c) {
      return /\S/.test(c);
    });
    console.log(chords);
    return chords.length;
  }

  function capture(payload) {
    if (payload.hasMotion) {
      // TODO: how to determine discrete motions from continuous input?
      // currently, one chord change == ~ 2 captured 'motions'
      if (nActualTransitions === nExpectedTransitions * 2) {
          // TODO: add @becky's 'when to scroll' logic
          if (currentLine % 2 === 0) {
            smoothScroll(1);
          }
          currentLine++;
          nExpectedTransitions = getChordLength(currentLine) - 1;
          nActualTransitions = 0;
        } else {
          nActualTransitions++;
        }
        console.log("counted transitions: ", nActualTransitions, "currentLine: ", currentLine)
    }
  }

  DiffCamEngine.init({
    pixelDiffThreshold: 40,
    scrollThreshold : 34,
    initSuccessCallback: initSuccess,
    initErrorCallback: initError,
    captureCallback: capture,
    debug: false // set to true to see video output
  });

});
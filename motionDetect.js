$(document).ready(function() {
  var numChordLines = $('.chords').length;
  var currentLine = 1;
  var nExpectedTransitions = getChordLength(currentLine);
  var nActualTransitions = 0;

  function initSuccess() {
    DiffCamEngine.start();
  }

  function initError() {
    alert('Motion Detection: Something went wrong.');
  }

  function getChordLength(current) {
    var chords = getChords(current).text().split(" ");
    chords = chords.filter(function(c) {
      return /\S/.test(c);
    });
    console.log(chords);
    return chords.length;
  }

  function getChords(id) { 
    return $("#"+id+"> div");
  }

  var chordIncrement = function(newID) {
    getChords(currentLine)[0].dispatchEvent(currentUpdate);
    if ((currentLine + 1) <= numChordLines)
      nExpectedTransitions = getChordLength(currentLine);
  }

  function capture(payload) {
    if (payload.hasMotion) {
      // TODO: how to determine discrete motions from continuous input?
      // currently, one chord change == ~ 2 captured 'motions'
      if (nActualTransitions >= nExpectedTransitions * 2) {
          getChords(currentLine).removeClass('current');  // TODO: TEST THIS CODE
          if (currentLine + 1 < numChordLines) {
            currentLine++;
            chordIncrement(currentLine);
            nActualTransitions = 0;
          }
        } else {
          nActualTransitions++;
        }
        console.log("counted transitions: ", nActualTransitions, "currentLine: ", currentLine)
    }
  }

  getChords(1).addClass('current');

  DiffCamEngine.init({
    pixelDiffThreshold: 40,
    scrollThreshold : 34,
    initSuccessCallback: initSuccess,
    initErrorCallback: initError,
    captureCallback: capture,
    debug: true // set to true to see video output
  });

});
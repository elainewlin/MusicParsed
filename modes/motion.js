/*
 * Creates a MotionDetect object.
 *
 * @param {SongView} (args.song) the current SongView that is being played
 * @param {int} (args.pixelDiffThreshold) the pixel difference threshold
 * @param {int} (args.scoreThreshold) min motion score needed to be considered substantial motion
 * @param {int} (args.x) x cutoff for region of interest in frame 
 * @param {int} (args.y) y-coord for region of interest in frame
 * @constructor
 */
var MotionDetect = function(args) {
  var that = this;

  /* Detection Variables */
  var ready = false;

  /* Line tracking variables */
  var song = args.song;
  var numChordLines = song.getTotalNumChordLines() - 1;
  var currentLine = 0;
  var nExpectedTransitions = song.getChordLength(currentLine);
  var nActualTransitions = 0;

  /*
   * Sets the current line that speech is tracking
   * @param {int} the new line number
   */
  that.setCurrentLine = function(newLineNum, fusing = false) {
    var info = {previousLine: currentLine, nextLine: newLineNum, fusing: fusing};
  	currentLine = newLineNum;
    nExpectedTransitions = song.getChordLength(currentLine);
    $(that).triggerHandler("motionUpdate", info); // update current line before event trigger in case fusion
  };

  /*
   * Sets motion detection status as 'ready'
  */
  that.setReady = function(isReady) {
    ready = isReady;
  }

  /*
   * Sets nActualTransitions to designated number
   */
   that.setActualTransitions = function(n) {
    nActualTransitions = n;
   }

  /*
   * Returns the current line that speech is tracking
   */
  that.getCurrentLine = function() {
  	return currentLine;
  };

  /*
   * Sets up, begins motion detection, and returns a DiffCamEngine object
   */
  that.start = function() {
    return DiffCamEngine.init({
      pixelDiffThreshold: args.pixelDiffThreshold,
      scoreThreshold : args.scoreThreshold,
      x: args.x,
      y: args.y,
      initSuccessCallback: initSuccess,
      initErrorCallback: initError,
      captureCallback: capture,
      debug: true // set to true to see video output
    });
  };

  /**** Motion Detection Helper Functions ****/

  var initSuccess = function() {
    DiffCamEngine.start();
  };

  var initError = function() {
    alert('Motion Detection: Something went wrong.');
  };

  var capture = function(payload) {
    if (payload.hasMotion && ready) {
      // TODO: how to determine discrete motions from continuous input?
      // currently, one chord change == ~ 2 captured 'motions'
      if (nActualTransitions >= nExpectedTransitions * 2) {
          if (currentLine + 1 <= numChordLines) {
            that.setCurrentLine(currentLine + 1);
            nActualTransitions = 0;
          }
        } else {
          nActualTransitions++;
        }
        console.log("counted transitions: ", nActualTransitions, "currentLine: ", currentLine)
    }
  };
};
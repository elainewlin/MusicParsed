/*
 * Creates a GazeTracker object.
 *
 * @param {boolean} (args.debug) turns red dot on/off
 * @param {boolean} (args.fusionDebug) turns fusion on or off
 * @constructor
 */
var GazeTracker = function(args) {
  var that = this;

  /* Detection Variables */
  var ready = false;

  /* Y-Coord Tracking Variables */
  var currentY;

  /*
   * Returns the current y-coordinate estimate
   */
  that.getCurrentY = function() {
    return currentY;
  };

  /*
   * Sets up and begins gaze tracking
   */
  that.start = function() {
    webgazer.setRegression('ridge') /* currently must set regression and tracker */
            .setTracker('clmtrackr') /* otherwise, it's jumpy */
            .setGazeListener(gazeListener)
            .showPredictionPoints(args.debug)
            .begin();
  };


  /**** Gaze Tracker Helper Functions ****/

  var smooth = function() {
    // TODO
  };

  var gazeListener = function(data, clock) {
    if (data == null) 
      return;

    if (args.fusionDebug)
      updateGazeY(data.y, clock)
    else {
      if (data.y > windowHeight * cutoff) {
        $(that).triggerHandler("gazeUpdate", {gazeTest: 'hello'});
        currentY = data.y;
      }
    }
  };
};
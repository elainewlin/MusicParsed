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
  var currentY=0;
  var detectedYs = [];

  /*
   * Returns the current y-coordinate estimate
   */
  that.getCurrentY = function() {
    return currentY;
  };

  /*
   * Sets gaze detection status as 'ready'
  */
  that.setReady = function(isReady) {
    ready = isReady;
  }

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

  var gazeListener = function(data, clock) {
    if (data == null) 
      return;

    if (args.fusionDebug && ready)
      updateGazeY(data.y, clock)
    // TODO: remove the following once fusion is done:
    else {
      if (data.y > WINDOW_HEIGHT * BOTTOM_REGION) {
        $(that).triggerHandler("gazeUpdate", {gazeTest: 'hello'});
        currentY = data.y;
      }
    }
  };

  var smooth = function(arr) {
    var total = 0;
    for(var i = 0; i < arr.length; i++) {
        total += arr[i];
    }
    return total / arr.length;
  };

  var updateGazeY = function(y, clock) {
    var ms = clock/1000;
    if (ms % GAZE_INTERVAL < 0.02 && detectedYs.length > 0) {
      console.log("3 seconds passed");
      currentY = smooth(detectedYs);
      $(that).triggerHandler("gazeUpdate");
      detectedYs = [];
    } else {
      detectedYs.push(y);
    }
  }
};
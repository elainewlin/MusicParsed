var GAZE_DEBUG = true;
var windowHeight = $(window).height();
var cutoff = 0.6; // set parameter to determine when to scroll down

window.onload = function() {
  var gazeEngine = webgazer
    .setRegression('ridge') /* currently must set regression and tracker */
    .setTracker('clmtrackr') /* otherwise, it's jumpy */
    .setGazeListener(function(data, clock) {
    if (data == null) {
      return;
    }

    var x = data.x; 
    var y = data.y; 

    if (y > windowHeight * cutoff) {
      smallScroll();
    }
  }).begin();

  if (GAZE_DEBUG)
    gazeEngine.showPredictionPoints(true); /* shows a square every 100 milliseconds where current prediction is */
};
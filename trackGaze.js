var GAZE_DEBUG = true;
var FUSION_DEBUG = false; 

window.onload = function() {
  var gazeEngine = webgazer
    .setRegression('ridge') /* currently must set regression and tracker */
    .setTracker('clmtrackr') /* otherwise, it's jumpy */
    .setGazeListener(function(data, clock) {
    if (data == null) {
      return;
    }
    
    if (FUSION_DEBUG) {
      updateGazeY(data.y, clock)
    } else {
      if (data.y > windowHeight * cutoff) {
        smallScroll();
      }      
    }

  }).begin();

  if (GAZE_DEBUG)
    gazeEngine.showPredictionPoints(true); /* shows a square every 100 milliseconds where current prediction is */
};
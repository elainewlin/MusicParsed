var GAZE_DEBUG = false;
var windowHeight = $(window).height();
var cutoff = 0.8; // set parameter to determine when to scroll down

window.onload = function() {
  var gazeEngine = webgazer.setGazeListener(function(data, clock) {
    if (data == null) {
      return;
    }

    var x = data.x; 
    var y = data.y; 

    if (y > windowHeight * 0.6) {
      smallScroll();
    }
  }).begin();

  if (GAZE_DEBUG)
    gazeEngine.showPredictionPoints(true); /* shows a square every 100 milliseconds where current prediction is */


// TODO: call this somewhere?
    // function checkIfReady() {
    //     if (webgazer.isReady()) {
    //         console.log('ready')
    //         return
    //     } else {
    //         setTimeout(checkIfReady, 100);
    //     }
    // }
    // setTimeout(checkIfReady,100);
};
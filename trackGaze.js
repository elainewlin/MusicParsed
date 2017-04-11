webgazer.begin();
var windowHeight = $(window).height();
var cutoff = 0.8; // set parameter to determine when to scroll down

webgazer.setGazeListener(function(data, elapsedTime) {
  if (data == null) {
    return;
  }

  var x = data.x; 
  var y = data.y; 

  if (y > windowHeight * 0.6) {
    smallScroll();
  }
  // else {
  //   smoothScroll(-1); TO-DO: should we ever scroll up?
  // }

})
.showPredictionPoints(true)
.begin();
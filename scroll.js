var scrolldelay;

/*
 * Constant scrolling
 */
var scroll = function(amt) {
  window.scrollBy(0,amt);
}

// Scroll Fusion
// TODO: refine this
var fusedScroll = function() {
  var windowHeight = $(window).height();
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + windowHeight;
  var yInView = finalY - docViewTop;
  
  var idealBottom = BOTTOM_REGION * windowHeight;
  var idealTop = TOP_REGION * windowHeight;
  var delta = 0;

  if (yInView > idealBottom) {
    console.log("FASTER")
    var slope = getSlope(idealBottom, IDEAL_SCROLL_DELTA, windowHeight, MAX_SCROLL_DELTA)
    delta = solveForY(slope, windowHeight, MAX_SCROLL_DELTA, yInView);
  } else if (yInView < idealTop) {
    console.log("SLOWER")
    var slope = getSlope(0, MIN_SCROLL_DELTA, idealTop, IDEAL_SCROLL_DELTA);
    delta = solveForY(slope, idealTop, IDEAL_SCROLL_DELTA, yInView);    
  } else {
    console.log("IDEAL");
    delta = IDEAL_SCROLL_DELTA;
  }
  scroll(SCROLL_AMT_DEFAULT + delta);
}

var getSlope = function (x1, y1, x2, y2) {
  return (y2-y1)/(x2-x1);
}

var solveForY = function (slope, x1, y1, x) {
  // point slope form: y-y_1 = m(x-x1)
  return slope*(x - x1) + y1;  
}
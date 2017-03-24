webgazer.begin();
var windowHeight = $(window).height();
var cutoff = 0.8; // set parameter to determine when to scroll down

/*
Parameters for page scroll:
- direction: 1 for scrolling down, -1 for scrolling up
- scrollSpeed: how quickly to scroll
- timeOfScroll: when to stop scrolling
*/
var smoothScroll = function(direction) {
  var amount = 5;
  window.scrollBy(0,amount*direction);
  scrolldelay = setTimeout(smoothScroll,10); // scrolls every 10 ms
}

webgazer.setGazeListener(function(data, elapsedTime) {
  if (data == null) {
    return;
  }

  var x = data.x; 
  var y = data.y; 

  if(y > windowHeight * 0.6) {
    smoothScroll(1);
  }
  // else {
  //   smoothScroll(-1); TO-DO: should we ever scroll up?
  // }

}).begin();
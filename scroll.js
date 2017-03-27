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
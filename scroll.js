/*
	Thoughts about combining modalities:
		- have a listener for each input that would trigger the scroll
		- if at least 2/3 listeners get fired, scroll down
		- have global boolean that keeps track of this....?
		- Probably want some kind of time-out too???
*/


/*
Parameters for page scroll:
- direction: 1 for scrolling down, -1 for scrolling up
- scrollSpeed: how quickly to scroll
- timeOfScroll: when to stop scrolling
*/
var smoothScroll = function(direction) {
	var viewportHeight = $(window).height();
	var currentScrollTop = $('body').scrollTop();
  var amount = viewportHeight * 0.5;

  $('html, body').animate({
	    scrollTop: currentScrollTop + amount
	 }, 1500);
}

// Need to be able to listen every time the "current" div updates
$(document).ready( function() {
	$('.lyrics').each(function(index, elem) {
		elem.addEventListener('onCurrentUpdate', function(e) {
			$(e.target).addClass('current');
			var divOffset = e.target.getBoundingClientRect();
			var viewportHeight = $(window).height();
			if (Math.abs(divOffset.top - viewportHeight) < 100) {
				smoothScroll(1);
			}
		});
	});
});
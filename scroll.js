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
  // console.log("FUSED SCROLL")
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();
  var yInView = finalY - docViewTop;

  if (scrolldelay)
    clearInterval(scrolldelay);

  if (yInView < TOP_REGION * WINDOW_HEIGHT) {
    console.log("SLOW SCROLL")
    scrolldelay = setInterval(
      function(){
        scroll(SLOW_SCROLL_AMT);
      },SCROLL_INTERVAL);
  } else if (yInView > BOTTOM_REGION * WINDOW_HEIGHT) {
    console.log("FAST SCROLL")
    scrolldelay = setInterval(
      function(){
        scroll(FAST_SCROLL_AMT);
      },SCROLL_INTERVAL);
  } else {
    console.log('ideal region')
    scrolldelay = setInterval(
      function(){
        scroll(IDEAL_SCROLL_AMT);
      },IDEAL_SCROLL_INTERVAL);
  }
}

/*
var bigScroll = function() {
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
        bigScroll();
      }
    });
  });
});
*/
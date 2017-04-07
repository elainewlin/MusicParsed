$(document).ready(function() {

  var video = document.getElementById('video');
  var canvas = document.getElementById('motion');
  var score = document.getElementById('score');

  function initSuccess() {
    DiffCamEngine.start();
  }

  function initError() {
    alert('Something went wrong.');
  }

  function capture(payload) {
    score.textContent = payload.score;
  }

  DiffCamEngine.init({
    video: video,
    motionCanvas: canvas,
    initSuccessCallback: initSuccess,
    initErrorCallback: initError,
    captureCallback: capture
  });

})

// var LEAPSCALE = 0.6;
// var getChordLength = function(current) {
//   var chords = $("#" + current+" > pre").text().split(" ");
//   chords = chords.filter(function(c) {
//     return /\S/.test(c);
//   });
//   return chords.length;
// }

// var currentLine = 1;
// var nTransitions = getChordLength(currentLine) - 1;
// var nMovements = 0;
// Leap.loop({hand: function(hand) {
//   // if only one hand
//   // count number of movements
//   // check if can get history of frames..
//   var previousFrame = this.frame(10); // initiate this?
//   var movement = hand.translation(previousFrame);
//   // movement[0] = x
//   // movement[1] = y
//   // movement[2] = z
//   var xThresh = 1;
//   var yThresh = 0.5;
//   var zThresh = 0.5;
//   if (movement[0] > xThresh && 
//     movement[1] > yThresh && 
//     movement[2] > zThresh) {
//     console.log(movement);
//     nMovements++;
//   }

//   if (nMovements === nTransitions) {
//     if (currentLine === "NEAR THE BOTTOM") {
//       smoothScroll(1);
//     }
//     currentLine++;
//     nTransitions = getChordLength(currentLine) - 1;
//   }
//   // var xPos = hand.screenPosition()[0];
//   // var yPos = hand.screenPosition()[1];
//   // console.log(xPos, yPos);
// }}).use('screenPosition', {scale: LEAPSCALE});
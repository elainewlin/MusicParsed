var windowHeight = $(window).height();
var yGaze = 0; // default
var checked = [];

var Y_Fused_Line = windowHeight *0.5; // TODO: connect with actual fused_line Y_coord
var w = 0.5; // TODO: update this when parameter testing
var cutoff = 0.6; // TODO: determine this when parameter testing
var gazeInterval = 3; // seconds

/*
* Gaze ---> y-coord
* => updates gaze tracking less frequently; outputs a Y-Coord value
*/
var average = function(arr) {
	var total = 0;
	for(var i = 0; i < arr.length; i++) {
	    total += arr[i];
	}
	return total / arr.length;
}

var updateGazeY = function(y, clock) {
	var ms = clock/1000;
	if (ms % gazeInterval < 0.02 && checked.length > 0) {
		console.log("3 seconds passed");
		yGaze = average(checked);
		if (yGaze > windowHeight * cutoff) {
			console.log(yGaze)
			fusedY(Y_Fused_Line, yGaze, w);
		}
		checked = [];
	} else {
		checked.push(y);
	}
}

/*
* Gaze + fused line # --> fused y-coord
* => Gets best estimate of which Y-Coord actually is
*/
var fusedY = function(yLine, yGaze, w) {
   var result = (w*(yLine) + (1-w)*yGaze)/2;
   console.log("RESULT: ", result)
   smallScroll(); // TODO: scroll rate fusion code
   return result;
}
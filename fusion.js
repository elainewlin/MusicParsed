/*
 * Averages line number from motion and speech modalities
 * Outputs integer representing difference from top of browser window
 */
var fusedLineToY = function() {
	if (!motion && !speech)
		return 0;
	var fusedLine = 0;
	if (motion && !speech) {
		fusedLine = motion.getCurrentLine();
	} else if (!motion && speech) {
		fusedLine = speech.getCurrentLine();
	} else if (motion && speech) {
		var lineMotion = motion.getCurrentLine();
		var lineSpeech = speech.getCurrentLine();
		fusedLine = Math.max(Math.ceil((MOTION_W*(lineMotion) + SPEECH_W*lineSpeech)), 1);

		motion.setCurrentLine(fusedLine, true); // true === is currently fusing
		speech.setCurrentLine(fusedLine, true);
	}
	return $('#'+fusedLine).offset().top;
}

/*
 * Fuses modalities and triggers scroll
 * Not called when no modalities are selected
*/
var fuse = function() {
	var yGaze = gaze ? gaze.getCurrentY() : 0;
  var yLine = fusedLineToY();
  if (yLine === 0) {
  	finalY = yGaze;
  } else if (yGaze === 0) {
  	finalY = yLine;
  } else {
  	var result = ((1-LINE_W)*(yLine) + GAZE_W*yGaze);
  	// fusedScroll(result);
  	finalY = result;
  }
  console.log('yGaze: ', yGaze, 'yLine: ', yLine)
}

var speechOn = (window.localStorage.getItem("speechOn") === "true");
var motionOn = (window.localStorage.getItem("motionOn") === "true");
var gazeOn = (window.localStorage.getItem("gazeOn") === "true");

$(document).ready(function() {

	// Note: this class will be useful for connecting motion and speech fusion 
	//  with the view
	var songViewParams = {
		numLyricLines: $('.lyrics').length,
		numChordLines: $('.chords').length,
		debug: false
	};
	var songView = new SongView(songViewParams);

	/**** Speech Recognition Set-Up ****/
	if (speechOn) {
		var speechParams = {
			song: songView,
			matchCutoff: 3,
			finalId: 'final_span',
			interimId: 'interim_span',
			endTimeout: 1000
		};
		var speech = new SpeechRec(speechParams);
		songView.getLineElement(speech.getCurrentLine()).addClass('current');
		speech.start();

		// listens for when the speech recognition updates the line
		$(speech).on('speechUpdate', function(e, info) {
	  	console.log(info);
	  	songView.getLineElement(info.previousLine).removeClass('current');
	  	songView.getLineElement(info.nextLine).addClass('current');
	  });

	  $(".line").click(function(e) {
	    var id = e.currentTarget.id;
	    speech.setCurrentLine(parseInt(id));
	  });
	}
	
	/**** Motion Detection Set-Up ****/
	if (motionOn) {
		var motionParams = {
			song: songView,
			pixelDiffThreshold: 40,
			scrollThreshold: 34
		};
		var motion = new MotionDetect(motionParams);
		songView.getChordElement(motion.getCurrentLine()).addClass('current');
		var engine = motion.start();

		// Calibration video removal
	  $('#calibrate').click(function() {
	    engine.removeVid();
	    $(this).remove();
	    ready = true;
	  });

	  // listens for when the motion detection updates the line
	  $(motion).on('motionUpdate', function(e, info) {
	  	console.log(info);
	  	songView.getChordElement(info.previousLine).removeClass('current');
	  	songView.getChordElement(info.nextLine).addClass('current');
	  });

	  $(".line").click(function(e) {
	    var id = e.currentTarget.id;
	    motion.setCurrentLine(parseInt(id));
	  });
	}
	
  /*** Gaze Tracking Set-Up ***/
  if (gazeOn) {
  	var gazeParams = {
	  	fusionDebug: false,
	  	debug: true // turns on the red dot
	  };
	  var gaze = new GazeTracker(gazeParams);
	  gaze.start();

	  // listens for when the gaze tracking updates the y-coord
	  $(gaze).on('gazeUpdate', function(e, info) {
	  	console.log(info);
	  });
  }
});
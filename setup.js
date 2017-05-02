var speechOn = (window.localStorage.getItem("speechOn") === "true");
var motionOn = (window.localStorage.getItem("motionOn") === "true");
var gazeOn = (window.localStorage.getItem("gazeOn") === "true");

var debugOn = (window.localStorage.getItem("debugOn") === "true");

// Modes 
var speech;
var motion;
var gaze;
var songView;

var finalY;

$(document).ready(function() {

  $(document).on('click', '#start', function() {
    setInterval(function(){
        fusedScroll();
      },SCROLL_INTERVAL);

    if (gaze) {
      gaze.setReady(true);
    }
  });

  var songViewParams = {
    numLyricLines: $('.lyrics').length,
    numChordLines: $('.chords').length,
    debug: false
  };
  songView = new SongView(songViewParams);

  /**** Speech Recognition Set-Up ****/
  if (speechOn) {
    var speechParams = {
      song: songView,
      matchCutoff: 3,
      finalId: 'final_span',
      interimId: 'interim_span',
      endTimeout: 1000
    };
    speech = new SpeechRec(speechParams);

    if (debugOn)
      songView.getLineElement(speech.getCurrentLine()).addClass('current');
    
    speech.start();

    // listens for when the speech recognition updates the line
    $(speech).on('speechUpdate', function(e, info) {
      
      if (debugOn) {
        songView.getLineElement(info.previousLine).removeClass('current');
        songView.getLineElement(info.nextLine).addClass('current');
      }
      
      if (!info.fusing)
        fuse();
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
      pixelDiffThreshold: PIXEL_DIFF,
      scoreThreshold: SCORE_THRESH,
      x: MOTION_X,
      y: MOTION_Y
    };
    motion = new MotionDetect(motionParams);

    if (debugOn)
      songView.getChordElement(motion.getCurrentLine()).addClass('current');
    
    var engine = motion.start();

    // Calibration video removal
    $('#calibrate').click(function() {
      engine.removeVid();
      $(this).remove();
      setTimeout(function() {
        console.log('hai')
        motion.setReady(true);
      }, 3000); // time between pressing and putting hand back on uke
      // motion.setReady(true);
    });

    // listens for when the motion detection updates the line
    $(motion).on('motionUpdate', function(e, info) {
      
      if (debugOn) {
        songView.getChordElement(info.previousLine).removeClass('current');
        songView.getChordElement(info.nextLine).addClass('current');  
      }
      
      if (!info.fusing)
        fuse();
    });

    $(".line").click(function(e) {
      var id = e.currentTarget.id;
      motion.setCurrentLine(parseInt(id));
      motion.setActualTransitions(0);
    });
  } else {
    $('#calibrate').remove(); // TODO: create element in js instead of html
  }
  
  /*** Gaze Tracking Set-Up ***/
  if (gazeOn) {
    var gazeParams = {
      fusionDebug: true,
      debug: debugOn // turns on the red dot
    };
    gaze = new GazeTracker(gazeParams);
    gaze.start();

    // listens for when the gaze tracking updates the y-coord
    $(gaze).on('gazeUpdate', function(e, info) {
      fuse();
    });
  }
});
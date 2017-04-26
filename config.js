// General Params
const WINDOW_HEIGHT = $(window).height(); // remove windowHeight after fusion is done
const TOP_REGION = 0.3;
const BOTTOM_REGION = 0.6;

// Motion Params
const PIXEL_DIFF = 80;
const SCORE_THRESH = 15;
const MOTION_X = 40;
const MOTION_Y = 30;

// Gaze Params
const GAZE_INTERVAL = 3; // in seconds

// Fusion Params
const MOTION_W = 0.6; // use 0.4 if not using gaze
const SPEECH_W = 1 - MOTION_W;

const LINE_W = 0.95; 
const GAZE_W = 1 - LINE_W;

// Fused Scrolling Params
const SCROLL_AMT_DEFAULT = 1; // range: [0, 5] pixels
const SCROLL_INTERVAL = 1000; // in ms

const MAX_SCROLL_DELTA = 300;
const MIN_SCROLL_DELTA = -20; // can scroll up a little, can change if necessary
const IDEAL_SCROLL_DELTA = 0; // range: [-SCROLL_AMT_DEFAULT, 0]
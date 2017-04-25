// General Params
const WINDOW_HEIGHT = $(window).height();
const TOP_REGION = 0.3;
const BOTTOM_REGION = 0.6;

// Motion Params
const PIXEL_DIFF = 80;
const SCORE_THRESH = 15;
const MOTION_X = 45;
const MOTION_Y = 30;

// Gaze Params
const GAZE_INTERVAL = 3; // in seconds

// Fusion Params
const MOTION_W = 0.3;
const SPEECH_W = 1 - MOTION_W;

const LINE_W = 0.5;
const GAZE_W = 1 - LINE_W;

// Fused Scrolling Params
const SCROLL_INTERVAL = 10; // in ms
const SLOW_SCROLL_AMT = 2; // pixels
const FAST_SCROLL_AMT = 5; // pixels
const IDEAL_SCROLL_AMT = 1;
const IDEAL_SCROLL_INTERVAL = 1000;
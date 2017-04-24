/*
 * Creates a SongView object.
 *
 * @param {int} (args.numLyricLines) the number of lyric lines in the song
 * @param {int} (args.numChordLines) the number of chord lines in the song
 * @param {boolean} (args.debug) debug toggle for highlighting
 * @constructor
 */
var SongView = function(args) {
  var that = this;

  var currentLine = 0;
  var numLyricLines = args.numLyricLines-1;
  var numChordLines = args.numChordLines-1;

  /*
   * Returns the total number of lyrics lines in the song
   */
  that.getTotalNumLines = function() {
    return numLyricLines;
  };

  /*
   * Returns the total number of chord lines in the song
   */
  that.getTotalNumChordLines = function() {
    return numChordLines;
  };

  /*
   * @param {int} the line number of the lyric
   * Returns the span element containing the lyrics correpsonding 
   *  to the specific line number
   */
  that.getLineElement = function(id) {
    return $("#"+id+"> span");
  };

  /*
   * Returns the div element contraining the chords corresponding
   *  to the line number
   */
  that.getChordElement = function(id) { 
    return $("#"+id+"> div");
  }

  /*
   * Returns the number of chords for the given line number
   */
  that.getChordLength = function(id) {
    var chords = that.getChordElement(id).text().split(" ");
    chords = chords.filter(function(c) {
      return /\S/.test(c);
    });
    console.log(chords);
    return chords.length;
  }

  /*
   * Returns the current line number in the song.
   */
  that.getCurrentLine = function() {
    return currentLine;
  };

  /*
   * @param {int} the new line number
   * Updates the current line number and the view accordingly
   */
  that.setCurrentLine = function(newLineNum) {
    $(that).triggerHandler("songUpdate", {previousLine: currentLine, nextLine: newLineNum});
    currentLine = newLineNum;
  };
 };
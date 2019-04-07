import { pitchToFifths } from "./chordHelpers";
export type SongLine = {label: string} | {chord: string; lyrics: string};

const guitarChords: { [flavor: string]: string }[] = [
  /* C  */
  {"": "x,3,2,0,1,0", "m7sus4": "8,8,8,8,8,8", "madd9": "x,3,0,4,4,3", "dim7": "x,3,x,2,4,2", "aug7": "x,x,2,3,1,4", "aug": "x,3,2,1,1,0", "m7": "x,3,5,3,4,3", "m6": "8,10,10,8,10,8", "5": "x,3,5,5,x,x", "7": "x,3,2,3,1,0", "6": "x,3,5,5,5,5", "9": "x,3,2,3,3,3", "maj7": "x,3,2,0,0,0", "m9": "x,3,1,3,3,x", "sus2": "x,3,0,0,3,3", "sus4": "8,10,10,10,8,8", "2": "x,3,0,0,3,3", "11": "8,8,8,9,8,8", "dim": "x,3,1,x,1,1", "13": "8,x,8,9,10,x", "add4": "x,3,3,0,1,0", "add2": "x,3,0,0,3,0", "m7b5": "x,3,4,3,4,x", "msus4": "8,8,10,8,8,8", "m": "x,3,5,5,4,3", "add9": "x,3,0,0,0,0", "7sus4": "x,3,5,3,6,3"},
  /* Db */
  {"": "x,4,6,6,6,4", "m7sus4": "9,9,9,9,9,9", "madd9": "x,4,1,1,1,0", "dim7": "9,x,8,9,8,x", "aug7": "x,4,3,2,0,x", "aug": "x,4,3,2,2,x", "m7": "x,4,2,1,0,0", "m6": "9,11,11,9,11,9", "5": "x,4,6,6,x,x", "7": "x,4,6,4,6,4", "6": "x,4,6,6,6,6", "9": "9,8,9,8,x,x", "maj7": "x,4,3,1,1,1", "m9": "x,4,2,4,4,x", "sus2": "x,4,6,6,4,4", "sus4": "x,4,4,6,7,4", "2": "x,4,6,6,4,4", "11": "9,9,9,10,9,9", "dim": "x,4,2,0,2,0", "13": "9,x,9,10,11,x", "add4": "x,4,4,6,6,4", "add2": "9,6,6,6,6,9", "m7b5": "x,4,2,0,0,0", "msus4": "9,9,11,9,9,9", "m": "x,4,2,1,3,x", "add9": "x,4,1,1,1,1", "7sus4": "x,4,4,4,2,4"},
  /* D  */
  {"": "x,x,0,2,3,2", "m7sus4": "10,10,10,10,10,10", "madd9": "10,12,11,10,10,12", "dim7": "x,x,0,1,0,1", "aug7": "x,x,0,3,1,2", "aug": "x,x,0,3,3,2", "m7": "x,x,0,2,1,1", "m6": "x,x,0,2,0,1", "5": "x,5,7,7,x,x", "7": "x,x,0,2,1,2", "6": "x,x,0,2,0,2", "9": "x,5,4,5,5,5", "maj7": "x,5,4,2,2,2", "m9": "x,5,3,5,5,x", "sus2": "x,x,0,2,3,0", "sus4": "x,x,0,2,3,3", "2": "x,x,0,2,3,0", "11": "10,10,10,11,10,10", "dim": "x,x,0,1,3,1", "13": "x,5,x,5,7,7", "add4": "x,5,5,7,7,5", "add2": "10,7,7,7,7,10", "m7b5": "x,x,0,1,1,1", "msus4": "10,10,12,10,10,10", "m": "x,x,0,2,3,1", "add9": "x,5,2,2,2,2", "7sus4": "x,x,0,2,1,3"},
  /* Eb */
  {"": "x,x,1,3,4,3", "m7sus4": "11,11,11,11,11,11", "madd9": "11,8,8,11,11,10", "dim7": "x,x,1,2,1,2", "aug7": "x,x,1,4,2,3", "aug": "x,x,1,0,0,3", "m7": "x,x,1,3,2,2", "m6": "x,x,1,3,1,2", "5": "x,6,8,8,x,x", "7": "x,x,1,3,2,3", "6": "x,x,1,3,1,3", "9": "x,x,1,0,2,1", "maj7": "x,x,1,3,3,3", "m9": "11,x,11,11,11,13", "sus2": "x,x,1,3,4,1", "sus4": "x,x,1,3,4,4", "2": "x,x,1,3,4,1", "11": "11,11,11,12,11,11", "dim": "x,x,1,2,4,2", "13": "11,x,11,12,13,x", "add4": "x,6,6,8,8,6", "add2": "11,8,8,8,8,11", "m7b5": "x,x,1,2,2,2", "msus4": "11,11,8,11,11,11", "m": "11,13,13,11,11,11", "add9": "x,6,3,3,3,3", "7sus4": "x,6,8,6,9,x"},
  /* E  */
  {"": "0,2,2,1,0,0", "m7sus4": "0,0,0,0,0,0", "madd9": "0,2,1,0,0,2", "dim7": "x,x,2,3,2,3", "aug7": "0,3,0,1,1,x", "aug": "0,3,2,1,3,0", "m7": "0,2,2,0,3,0", "m6": "12,x,11,12,12,x", "5": "0,2,2,x,x,x", "7": "0,2,0,1,0,0", "6": "0,2,2,1,2,0", "9": "0,2,0,1,0,2", "maj7": "0,2,1,1,0,0", "m9": "0,2,0,0,0,2", "sus2": "0,2,4,4,0,0", "sus4": "0,2,2,2,0,0", "2": "0,2,4,4,0,0", "11": "0,0,0,1,0,0", "dim": "x,x,2,3,5,3", "13": "0,x,0,1,2,2", "add4": "0,0,2,1,0,0", "add2": "0,2,2,1,0,2", "m7b5": "x,x,2,3,3,3", "msus4": "0,0,2,0,0,0", "m": "0,2,2,0,0,0", "add9": "0,2,1,1,0,2", "7sus4": "0,2,2,2,3,0"},
  /* F  */
  {"": "1,3,3,2,1,1", "m7sus4": "1,1,1,1,1,1", "madd9": "1,3,2,1,1,3", "dim7": "x,x,3,4,3,4", "aug7": "1,x,1,2,2,x", "aug": "x,x,3,2,2,1", "m7": "1,3,3,1,4,1", "m6": "x,x,3,5,3,4", "5": "1,3,3,x,x,x", "7": "1,x,1,2,1,x", "6": "1,3,x,2,3,x", "9": "1,3,1,2,1,3", "maj7": "1,x,2,2,1,x", "m9": "1,x,1,1,1,3", "sus2": "x,8,10,10,8,8", "sus4": "1,3,3,3,1,1", "2": "x,8,10,10,8,8", "11": "1,1,1,2,1,1", "dim": "x,x,3,1,0,1", "13": "1,3,1,2,3,1", "add4": "1,0,3,3,1,1", "add2": "1,0,3,0,1,1", "m7b5": "x,x,3,4,4,4", "msus4": "1,1,3,1,1,1", "m": "1,3,3,1,1,1", "add9": "1,0,2,0,1,0", "7sus4": "1,3,1,3,1,1"},
  /* Gb */
  {"": "2,4,4,3,2,2", "m7sus4": "2,2,2,2,2,2", "madd9": "2,4,3,2,2,4", "dim7": "2,x,1,2,1,x", "aug7": "2,x,2,3,3,x", "aug": "x,x,4,3,4,2", "m7": "2,x,2,2,2,x", "m6": "2,x,1,2,2,2", "5": "2,4,4,x,x,x", "7": "x,x,4,3,2,0", "6": "x,9,11,11,11,11", "9": "x,x,4,3,5,4", "maj7": "x,x,4,3,2,1", "m9": "2,0,2,1,2,x", "sus2": "x,9,11,11,9,9", "sus4": "2,4,4,4,2,2", "2": "x,9,11,11,9,9", "11": "2,2,2,3,2,2", "dim": "x,x,4,2,1,2", "13": "2,x,2,3,4,4", "add4": "2,2,4,3,2,2", "add2": "2,4,4,3,2,4", "m7b5": "x,x,4,5,5,5", "msus4": "2,2,4,2,2,2", "m": "2,4,4,2,2,2", "add9": "2,1,3,1,2,2", "7sus4": "2,4,2,4,2,2"},
  /* G  */
  {"": "3,2,0,0,0,3", "m7sus4": "3,3,3,3,3,3", "madd9": "3,0,0,3,3,2", "dim7": "3,x,2,3,2,x", "aug7": "3,x,3,4,4,x", "aug": "3,2,1,0,0,3", "m7": "3,x,3,3,3,x", "m6": "3,x,2,3,3,x", "5": "3,5,5,x,x,x", "7": "3,2,0,0,0,1", "6": "3,5,5,3,3,3", "9": "3,x,0,2,0,1", "maj7": "3,2,0,0,0,2", "m9": "3,x,3,3,3,5", "sus2": "x,10,12,12,10,10", "sus4": "3,5,5,5,3,3", "2": "x,10,12,12,10,10", "11": "3,3,0,0,0,1", "dim": "x,x,x,0,2,3", "13": "3,x,3,0,0,0", "add4": "3,3,0,0,0,3", "add2": "3,0,0,0,0,3", "m7b5": "x,x,5,6,6,6", "msus4": "3,3,0,3,3,3", "m": "x,10,12,12,11,10", "add9": "3,0,0,0,0,2", "7sus4": "3,5,3,5,3,3"},
  /* Ab */
  {"": "4,6,6,5,4,4", "m7sus4": "4,4,4,4,4,4", "madd9": "4,1,1,0,0,4", "dim7": "4,x,3,4,3,x", "aug7": "4,x,4,5,5,x", "aug": "4,3,2,1,1,x", "m7": "4,x,4,4,4,x", "m6": "4,6,6,4,6,4", "5": "4,6,6,x,x,x", "7": "4,6,4,5,4,4", "6": "x,x,6,8,6,8", "9": "4,x,4,3,1,x", "maj7": "4,6,5,5,4,4", "m9": "4,x,4,4,4,6", "sus2": "x,x,6,8,6,7", "sus4": "4,6,6,6,4,4", "2": "x,x,6,8,6,7", "11": "4,4,4,5,4,4", "dim": "4,2,0,1,0,x", "13": "4,x,4,5,6,x", "add4": "4,4,1,1,1,4", "add2": "4,1,1,1,1,4", "m7b5": "x,x,6,7,7,7", "msus4": "4,4,6,4,4,4", "m": "x,11,13,13,12,11", "add9": "4,1,1,0,1,4", "7sus4": "4,6,4,6,4,4"},
  /* A  */
  {"": "x,0,2,2,2,0", "m7sus4": "5,5,5,5,5,5", "madd9": "5,7,6,5,5,7", "dim7": "x,0,1,2,1,2", "aug7": "5,x,5,6,6,x", "aug": "x,0,3,2,2,1", "m7": "x,0,2,0,1,0", "m6": "x,0,2,2,1,2", "5": "x,0,2,2,x,x", "7": "x,0,2,0,2,0", "6": "x,0,2,2,2,2", "9": "x,0,2,4,2,3", "maj7": "x,0,2,1,2,0", "m9": "5,3,2,0,0,0", "sus2": "x,0,2,2,0,0", "sus4": "x,0,0,2,3,0", "2": "x,0,2,2,0,0", "11": "5,5,5,6,5,5", "dim": "x,0,1,2,1,x", "13": "x,0,2,0,2,2", "add4": "5,5,2,2,2,5", "add2": "5,2,2,2,2,5", "m7b5": "x,0,1,2,1,3", "msus4": "5,5,7,5,5,5", "m": "x,0,2,2,1,0", "add9": "x,0,2,4,2,0", "7sus4": "x,0,2,2,3,3"},
  /* Bb */
  {"": "6,8,8,7,6,6", "m7sus4": "6,6,6,6,6,6", "madd9": "6,8,7,6,6,8", "dim7": "x,1,2,0,2,x", "aug7": "x,1,x,1,3,2", "aug": "x,1,0,3,3,1", "m7": "x,1,3,1,2,1", "m6": "x,1,3,0,2,x", "5": "x,1,3,3,x,x", "7": "x,1,3,1,3,1", "6": "x,1,3,3,3,3", "9": "x,1,0,1,1,1", "maj7": "6,x,7,7,6,x", "m9": "6,x,6,6,6,8", "sus2": "x,1,3,3,1,1", "sus4": "x,1,1,3,4,1", "2": "x,1,3,3,1,1", "11": "6,6,6,7,6,6", "dim": "x,1,2,3,2,0", "13": "x,1,x,1,3,3", "add4": "x,1,1,3,3,1", "add2": "6,3,3,3,3,6", "m7b5": "x,1,x,1,2,0", "msus4": "6,6,8,6,6,6", "m": "6,8,8,6,6,6", "add9": "x,1,0,2,1,1", "7sus4": "x,1,3,1,4,1"},
  /* B  */
  {"": "x,2,4,4,4,2", "m7sus4": "7,7,7,7,7,7", "madd9": "x,2,0,3,2,2", "dim7": "x,2,3,1,3,x", "aug7": "x,2,1,2,0,3", "aug": "x,2,1,0,0,3", "m7": "x,2,0,2,0,2", "m6": "7,9,9,7,9,7", "5": "7,9,9,x,x,x", "7": "x,2,1,2,0,2", "6": "x,2,4,4,4,4", "9": "x,2,1,2,2,x", "maj7": "x,x,9,8,7,6", "m9": "x,2,0,2,2,2", "sus2": "x,2,4,4,2,2", "sus4": "x,2,2,4,5,2", "2": "x,2,4,4,2,2", "11": "7,7,7,8,7,7", "dim": "x,x,9,10,12,10", "13": "x,2,x,2,4,4", "add4": "x,2,2,4,4,2", "add2": "7,4,4,4,4,7", "m7b5": "x,2,x,2,3,1", "msus4": "1,1,3,3,1,1", "m": "x,2,2,4,4,3", "add9": "7,4,4,4,4,6", "7sus4": "x,2,4,2,5,2"},
];

const ukuleleChords: { [flavor: string]: string }[] = [
  /* C  */
  {"": "0,0,0,3", "m7sus4": "3,3,1,3", "madd9": "5,3,3,5", "dim7": "2,3,2,3", "aug7": "1,0,0,1", "aug": "1,0,0,3", "m7": "3,3,3,3", "m6": "2,3,3,3", "5": "0,0,3,3", "7": "0,0,0,1", "6": "0,0,0,0", "9": "3,0,0,1", "maj7": "0,0,0,2", "m9": "5,3,6,5", "sus2": "0,2,3,3", "sus4": "0,0,1,3", "2": "0,2,3,3", "11": "0,0,1,1", "dim": "x,3,2,3", "13": "3,0,0,0", "add4": "0,4,1,3", "add2": "0,2,0,3", "m7b5": "3,3,2,3", "msus4": "0,3,1,3", "m": "0,3,3,3", "add9": "0,2,0,3", "7sus4": "0,0,1,1", "7sus4_1": "0,5,6,3"},
  /* Db */
  {"": "1,1,1,4", "m7sus4": "6,6,7,7", "madd9": "6,4,4,6", "dim7": "0,1,0,1", "aug7": "2,1,1,2", "aug": "2,1,1,0", "m7": "1,1,0,2", "m6": "1,1,0,1", "5": "1,1,4,4", "7": "1,1,1,2", "6": "1,1,1,1", "9": "1,3,1,2", "maj7": "1,1,1,3", "m9": "4,3,0,4", "sus2": "1,3,4,4", "sus4": "1,1,2,4", "2": "8,8,4,4", "11": "1,1,2,2", "dim": "0,1,0,4", "13": "4,0,0,0", "add4": "10,8,9,9", "add2": "8,8,9,8", "m7b5": "0,1,0,2", "msus4": "9,8,9,9", "m": "1,1,0,x", "add9": "1,3,1,4", "7sus4": "1,1,2,2"},
  /* D  */
  {"": "2,2,2,0", "m7sus4": "0,2,1,3", "madd9": "7,5,5,7", "dim7": "1,2,1,2", "aug7": "3,2,2,3", "aug": "3,2,2,1", "m7": "2,2,1,3", "m6": "2,2,1,2", "5": "2,2,x,0", "7": "2,2,2,3", "6": "2,2,2,2", "9": "5,4,2,4", "maj7": "2,2,2,4", "m9": "5,4,1,5", "sus2": "2,2,0,0", "sus4": "2,2,3,0", "2": "2,2,0,0", "11": "2,2,3,3", "dim": "1,2,1,x", "13": "5,2,2,2", "add4": "0,2,2,0", "add2": "9,9,10,9", "m7b5": "1,2,1,3", "msus4": "0,2,1,0", "m": "2,2,1,0", "add9": "2,4,2,5", "7sus4": "2,2,3,3"},
  /* Eb */
  {"": "0,3,3,1", "m7sus4": "8,8,9,9", "madd9": "8,6,6,8", "dim7": "2,3,2,3", "aug7": "4,3,3,4", "aug": "0,3,3,2", "m7": "3,3,2,4", "m6": "3,3,2,3", "5": "3,3,6,6", "7": "3,3,3,4", "6": "3,3,3,3", "9": "0,1,1,1", "maj7": "3,3,3,5", "m9": "6,5,2,6", "sus2": "3,3,1,1", "sus4": "1,3,4,1", "2": "3,3,1,1", "11": "3,3,4,4", "dim": "2,3,2,0", "13": "6,2,2,2", "add4": "1,3,3,1", "add2": "0,3,1,1", "m7b5": "2,3,2,4", "msus4": "1,3,2,1", "m": "3,3,2,1", "add9": "0,3,1,1", "7sus4": "3,3,4,4"},
  /* E  */
  {"": "1,4,0,2", "m7sus4": "0,2,0,0", "madd9": "0,4,2,2", "dim7": "0,1,0,1", "aug7": "1,2,0,3", "aug": "1,0,0,3", "m7": "0,2,0,2", "m6": "0,1,0,2", "5": "4,4,0,2", "7": "1,2,0,2", "6": "4,4,4,4", "9": "1,2,2,2", "maj7": "1,3,0,2", "m9": "0,6,0,5", "sus2": "4,4,2,2", "sus4": "2,4,5,2", "2": "4,4,2,2", "11": "2,2,0,2", "dim": "0,4,0,1", "13": "1,2,0,4", "add4": "4,4,4,0", "add2": "11,11,12,11", "m7b5": "0,2,0,1", "msus4": "4,4,3,0", "m": "0,4,3,2", "add9": "1,4,2,2", "7sus4": "4,4,5,5"},
  /* F  */
  {"": "2,0,1,0", "m7sus4": "1,3,1,1", "madd9": "0,5,4,3", "dim7": "1,2,1,2", "aug7": "6,5,5,6", "aug": "2,1,1,0", "m7": "1,3,1,3", "m6": "1,2,1,3", "5": "x,0,1,3", "7": "2,3,1,3", "6": "2,2,1,3", "9": "2,3,3,3", "maj7": "2,4,1,3", "m9": "0,5,4,6", "sus2": "0,0,1,3", "sus4": "3,0,1,1", "2": "0,0,1,3", "11": "3,3,1,3", "dim": "1,x,1,2", "13": "8,5,5,5", "add4": "2,0,1,1", "add2": "0,0,1,0", "m7b5": "1,3,1,2", "msus4": "1,0,1,1", "m": "1,0,1,3", "add9": "0,0,1,0", "7sus4": "5,5,6,6", "maj7sus2": "0,4,1,3", "add9_1": "0,5,5,3"},
  /* Gb */
  {"": "3,1,2,1", "m7sus4": "4,4,2,0", "madd9": "1,1,2,0", "dim7": "2,3,2,3", "aug7": "7,6,6,7", "aug": "3,2,2,1", "m7": "2,4,2,4", "m6": "2,3,2,4", "5": "x,1,2,4", "7": "3,4,2,4", "6": "3,3,2,4", "9": "3,4,4,4", "maj7": "3,5,2,4", "m9": "1,4,2,0", "sus2": "1,1,2,4", "sus4": "4,1,2,2", "2": "6,6,4,4", "11": "4,4,2,4", "dim": "2,0,2,0", "13": "9,6,6,6", "add4": "3,1,2,2", "add2": "1,1,2,1", "m7b5": "2,4,2,3", "msus4": "2,1,2,2", "m": "2,1,2,0", "add9": "1,1,2,1", "7sus4": "6,6,7,7"},
  /* G  */
  {"": "0,2,3,2", "m7sus4": "0,0,1,1", "madd9": "3,2,3,0", "dim7": "0,1,0,1", "aug7": "0,3,1,2", "aug": "0,3,3,2", "m7": "0,2,1,1", "m6": "0,2,0,1", "5": "x,2,3,5", "7": "0,2,1,2", "6": "0,2,0,2", "9": "0,5,5,2", "maj7": "0,2,2,2", "m9": "0,2,1,1", "sus2": "0,2,3,0", "sus4": "0,2,3,3", "2": "0,2,3,0", "11": "0,0,1,0", "dim": "0,1,3,1", "13": "0,4,1,2", "add4": "4,2,3,3", "add2": "2,2,3,2", "m7b5": "0,1,1,1", "msus4": "3,2,3,3", "m": "0,2,3,1", "add9": "0,2,5,2", "7sus4": "0,2,1,3", "m7♭5": "3,2,2,2", "7sus2": "0,2,1,0"},
  /* Ab */
  {"": "5,3,4,3", "m7sus4": "1,1,2,2", "madd9": "4,3,4,1", "dim7": "1,2,1,2", "aug7": "9,8,8,9", "aug": "1,0,0,3", "m7": "1,3,2,2", "m6": "4,5,4,6", "5": "1,3,4,x", "7": "1,3,2,3", "6": "1,3,1,3", "9": "1,0,2,1", "maj7": "1,3,3,3", "m9": "11,10,7,11", "sus2": "1,3,4,1", "sus4": "1,3,4,4", "2": "8,8,6,6", "11": "1,1,2,1", "dim": "1,2,x,2", "13": "1,5,2,3", "add4": "6,8,8,6", "add2": "3,3,4,3", "m7b5": "1,2,2,2", "msus4": "4,3,4,4", "m": "4,3,4,2", "add9": "3,3,4,3", "7sus4": "1,3,2,4"},
  /* A  */
  {"": "2,1,0,0", "m7sus4": "2,2,3,3", "madd9": "2,0,0,2", "dim7": "2,3,2,3", "aug7": "0,1,1,0", "aug": "2,1,1,4", "m7": "0,0,0,0", "m6": "2,4,2,3", "5": "2,4,0,0", "7": "0,1,0,0", "6": "2,4,2,4", "9": "2,1,3,2", "maj7": "1,1,0,0", "m9": "1,0,3,2", "sus2": "2,4,5,2", "sus4": "2,2,0,0", "2": "4,4,0,0", "11": "2,2,3,2", "dim": "2,3,5,3", "13": "0,1,2,0", "add4": "2,2,0,4", "add2": "4,1,0,0", "m7b5": "2,3,3,3", "msus4": "2,2,0,3", "m": "2,0,0,0", "add9": "2,1,0,2", "7sus4": "0,2,0,0", "m7no5": "0,0,3,0", "7no3": "0,4,3,0"},
  /* Bb */
  {"": "3,2,1,1", "m7sus4": "3,3,4,4", "madd9": "3,1,1,3", "dim7": "0,1,0,1", "aug7": "1,2,2,1", "aug": "3,2,2,1", "m7": "1,1,1,1", "m6": "0,1,1,1", "5": "3,x,1,1", "7": "1,2,1,1", "6": "0,2,1,1", "9": "3,2,4,3", "maj7": "3,2,1,0", "m9": "3,1,4,3", "sus2": "3,0,1,1", "sus4": "3,3,1,1", "2": "3,0,1,1", "11": "3,3,4,3", "dim": "3,1,0,1", "13": "1,2,3,1", "add4": "8,10,10,8", "add2": "3,2,1,3", "m7b5": "1,1,0,1", "msus4": "6,5,6,6", "m": "3,1,1,1", "add9": "3,2,1,3", "7sus4": "1,3,1,1"},
  /* B  */
  {"": "4,3,2,2", "m7sus4": "2,2,0,2", "madd9": "4,2,2,4", "dim7": "1,2,1,2", "aug7": "2,3,3,2", "aug": "4,3,3,2", "m7": "2,2,2,2", "m6": "1,2,2,2", "5": "x,x,2,2", "7": "2,3,2,2", "6": "1,3,2,2", "9": "4,3,5,4", "maj7": "4,3,2,1", "m9": "4,2,5,4", "sus2": "4,1,2,2", "sus4": "4,4,2,2", "2": "6,6,2,2", "11": "4,4,5,4", "dim": "4,2,1,2", "13": "2,3,4,2", "add4": "9,11,11,9", "add2": "6,6,7,6", "m7b5": "2,2,1,2", "msus4": "7,6,7,7", "m": "4,2,2,2", "add9": "4,3,2,4", "7sus4": "2,4,2,2"},
];

export const instrumentsData: { [instrument: string]: InstrumentData } = {
  ukulele: {
    strings: 4,
    frets: 4,
    chords: ukuleleChords
  },
  baritone: {
    strings: 4,
    frets: 4,
    chords: ukuleleChords.slice(5).concat(ukuleleChords.slice(0, 5))
  },
  guitar: {
    strings: 6,
    frets: 5,
    chords: guitarChords
  },
  guitalele: {
    strings: 6,
    frets: 5,
    chords: guitarChords.slice(7).concat(guitarChords.slice(0, 7))
  }
};
// Support for left-handed chord diagrams
export const reverseString = function(str: string): string {
  return str.split("").reverse().join("");
};

type ChordFingeringData = {
  viewLeft: number;
  viewWidth: number;
  width: number;
  chordName: string;
  offset?: number;
  openY: number;
  dots: { x: number; y: number }[];
  open: number[];
  mute: number[];
} | {
  chordName: string;
  unknown: true;
}

export interface InstrumentData {
  strings: number;
  frets: number;
  chords: { [flavor: string]: string }[];
}

// Input example:
// chordName: Bm
// chordFingering: 4,2,2,2 for G,C,E,A
// instrumentData: what instrument?
// Output: SVG rendering of the chord
export const renderChordFingering = function(chordName: string, chordFingeringStr: string, instrumentData: InstrumentData): ChordFingeringData {
  const chordFingering = chordFingeringStr.split(",");
  var offset =
    chordFingering.every(function(y) {
      return !(+y > 0) || +y <= instrumentData.frets;
    }) ?
      1 :
      Math.min.apply(null, chordFingering.flatMap(function(y) {
        return +y > 0 ? [+y] : [];
      }));
  var left = offset == 1 ? 0 : 0.5 * ("" + offset).length;
  return {
    viewLeft: -0.5 - left,
    viewWidth: instrumentData.strings + left,
    width: (instrumentData.strings + left) * 11,
    chordName: chordName,
    offset: offset == 1 ? undefined : offset,
    openY: offset == 1 ? -0.5 : 0,
    dots: chordFingering.flatMap(function(y, x) {
      return +y > 0 ? [{ x: x, y: +y - offset + 1 }] : [];
    }),
    open: chordFingering.flatMap(function(y, x) {
      return +y == 0 ? [x] : [];
    }),
    mute: chordFingering.flatMap(function(y, x) {
      return y == "x" ? [x] : [];
    }),
  };
};

// Code is smart enough to auto-render chord thanks to regex magic
export const renderChord = function(chord: string, instrumentData: InstrumentData, orientation: string = "right"): ChordFingeringData {
  var chordName = chord;
  var m = chord.match(/^([A-G](?:bb|𝄫|b|♭|#|♯|x|𝄪)?)(.*)$/)!;
  var chordFingering = instrumentData.chords[(pitchToFifths.get(m[1])! * 7 + 12000) % 12][m[2]];

  const overrideDefaultChord = chord.includes("|");
  if (overrideDefaultChord) {
    const chordComponents = chord.split("|");
    chordName = chordComponents[0];
    chordFingering = chordComponents[1];
  }

  if (chordFingering) {
    if (orientation === "left") {
      chordFingering = reverseString(chordFingering);
    }
    return renderChordFingering(chordName, chordFingering, instrumentData);
  } else {
    return {
      chordName: chordName,
      unknown: true
    };
  }
};

interface ChordLyricPair {
  chord: string | null;
  lyric: string;
  overLyric?: true;
}

interface ChordLyricLine {
  className: string;
  chordLyricPairs: ChordLyricPair[];
}

export const renderChordLyricLine = function(chordString: string, lyrics: string): ChordLyricLine {
  let className = "line";

  if (chordString.length > 0 && lyrics.length > 0) {
    className = "chordLyricLine";
  }

  /**
  Keep track of the chords + their offset positions in the string i.e.
  Dm      G
  Hello world
  has offset + chords (0, "Dm"), (8, "G")
  */
  const chordBoundary = new RegExp(/\S+/, "g");

  const offsetChordPairs: { offset: number; chord: string | null }[] = [];
  chordString.replace(chordBoundary, function(chord, offset) {
    offsetChordPairs.push({offset, chord});
    return "";
  });
  if (offsetChordPairs.length === 0 || offsetChordPairs[0].offset !== 0) {
    offsetChordPairs.unshift({offset: 0, chord: null});
  }
  const maxOffset = offsetChordPairs[offsetChordPairs.length - 1].offset;

  lyrics = lyrics.padEnd(maxOffset);
  offsetChordPairs.push({offset: lyrics.length, chord: null});

  let chordLyricPairs: ChordLyricPair[] = [];

  for (let i = 0; i < offsetChordPairs.length - 1; i++) {
    const {offset: lastOffset, chord} = offsetChordPairs[i];
    const nextOffset = offsetChordPairs[i + 1].offset;
    let lyric = lyrics.slice(lastOffset, nextOffset);
    if (chord === null || /[^ ]/.test(lyric.slice(0, chord.length + 1))) {
      chordLyricPairs.push({chord, lyric, overLyric: true});
    } else {
      chordLyricPairs.push({chord, lyric: lyric.slice(chord.length)});
    }
  }
  // console.log(chordLyricPairs);

  return {
    className: className,
    chordLyricPairs: chordLyricPairs,
  };
};

type RenderedLine = {
  label: string;
} | ChordLyricLine;

export const renderLines = function(lines: SongLine[]): RenderedLine[] {
  let newLines: RenderedLine[] = [];

  lines.map((line) => {
    if ("label" in line) {
      newLines.push({
        label: line["label"],
      });
    } else {
      const chordString = line["chord"];
      const lyrics = line["lyrics"];
      newLines.push(renderChordLyricLine(chordString, lyrics));
    }
  });
  return newLines;
};
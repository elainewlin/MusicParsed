// We'll probably end up moving some of these functions to the parser since we're storing a new JSON format
import {reverseString, renderChord, renderChordFingering, renderChordLyricLine, renderLines, instrumentsData} from "../songParser";
import { assert, expect } from "chai";

describe("reverseString", () => {
  it("should reverse string", () => {
    const string = "2000";
    assert(reverseString(string) === "0002");
  });
});

describe("renderChord", () => {
  it("should override default chord fingering when specified", () => {
    const ukulele = instrumentsData.ukulele;
    const chord = "C|5,4,3,3";
    const result = renderChord(chord, ukulele);

    const expected = renderChordFingering("C", "5,4,3,3", ukulele);
    expect(result).to.eql(expected);
  });

  it("should render chord for all supported instruments", () => {
    const chord = "Em";
    const instrumentToFingering = {
      ukulele: "0,4,3,2",
      baritone: "2,0,0,0",
      guitar: "0,2,2,0,0,0",
      guitalele: "x,2,2,4,4,3"
    };

    Object.entries(instrumentToFingering).forEach(([instrumentName, fingering]) => {
      const instrument = instrumentsData[`${instrumentName}`];
      const result = renderChord(chord, instrument);
      const expected = renderChordFingering("Em", fingering, instrument);
      expect(result).to.eql(expected);
    });
  });

  it("should render left-handed chord when specified", () => {
    const ukulele = instrumentsData.ukulele;
    const chord = "Am";
    const result = renderChord(chord, ukulele, "left");

    const expected = renderChordFingering("Am", "0,0,0,2", ukulele);
    expect(result).to.eql(expected);
  });

  it("should render unknown chord", () => {
    const guitar = instrumentsData.guitar;
    const nonChord = "Am7add4sus2";
    const result = renderChord(nonChord, guitar);

    const expected = {
      chordName: nonChord,
      unknown: true
    };
    expect(result).to.eql(expected);

  });
});

describe("renderChordLyricLine", () => {
  it("should handle no chords/lyrics", () => {
    const result = renderChordLyricLine("", "");
    const expected = {
      className: "line",
      chordLyricPairs: [ { chord: null, lyric: "", overLyric: true } ]
    };
    expect(result).to.eql(expected);
  });
});

describe("renderLines", () => {
  it("should handle empty array", () => {
    const result = renderLines([]);
    expect(result).to.eql([]);
  });
});
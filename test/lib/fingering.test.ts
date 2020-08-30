import { instrumentsData } from "../../lib/instrument";
import {
  reverseString,
  getChordData,
  getChordFingering,
} from "../../lib/fingering";
import { assert } from "chai";

describe("reverseString", () => {
  it("should reverse string", () => {
    const string = "2000";
    assert(reverseString(string) === "0002");
  });
});

describe("getChordData", () => {
  it("should override default chord fingering when specified", () => {
    const ukulele = instrumentsData.ukulele;
    const chord = "C|5,4,3,3";
    const result = getChordData(chord, ukulele);

    const expected = getChordFingering("C", "5,4,3,3", ukulele);
    assert.deepEqual(result, expected);
  });

  it("should render chord for all supported instruments", () => {
    const chord = "Em";
    const instrumentToFingering = {
      ukulele: "0,4,3,2",
      baritone: "2,0,0,0",
      guitar: "0,2,2,0,0,0",
      guitalele: "x,2,4,4,3,2",
    };

    Object.entries(instrumentToFingering).forEach(
      ([instrumentName, fingering]) => {
        const instrument = instrumentsData[`${instrumentName}`];
        const result = getChordData(chord, instrument);
        const expected = getChordFingering("Em", fingering, instrument);
        assert.deepEqual(result, expected);
      }
    );
  });

  it("should render left-handed chord when specified", () => {
    const ukulele = instrumentsData.ukulele;
    const chord = "Am";
    const result = getChordData(chord, ukulele, "left");

    const expected = getChordFingering("Am", "0,0,0,2", ukulele);
    assert.deepEqual(result, expected);
  });

  it("should render unknown chord", () => {
    const guitar = instrumentsData.guitar;
    const nonChord = "Am7add4sus2";
    const result = getChordData(nonChord, guitar);

    const expected = {
      chordName: nonChord,
      unknown: true as true,
    };
    assert.deepEqual(result, expected);
  });
});

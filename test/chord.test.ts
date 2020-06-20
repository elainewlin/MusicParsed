import { transposeChord, simplifyChord } from "../lib/chord";
import { assert } from "chai";

describe("transposeChord", () => {
  it("should not touch chords when transpose is 0", () => {
    const result = transposeChord("C", 0);
    assert.equal(result, "C");
  });

  it("should transpose up a fifth", () => {
    const result = transposeChord("C", 1);
    assert.equal(result, "G");
  });
});

describe("simplifyChord", () => {
  it("should not change simple chords", () => {
    const simpleChords = ["Am", "C"];
    simpleChords.forEach(chord => {
      assert.equal(simplifyChord(chord), chord);
    });
  });

  it("should remove last part of the chord", () => {
    const chords = ["Am/C", "Am7", "Amadd9"];
    chords.forEach(chord => {
      assert.equal(simplifyChord(chord), "Am");
    });
  });
});

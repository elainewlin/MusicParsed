import { transposeChord } from "../lib/chord";
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

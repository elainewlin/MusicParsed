import { instrumentsData } from "../../lib/instrument";
import { assert } from "chai";

describe("instrumentsData", () => {
  it("should sanity-check chords have right number of strings", () => {
    for (const instrumentData of Object.values(instrumentsData)) {
      const strings = instrumentData.strings;

      for (const root of instrumentData.chords) {
        for (const fingering of root.values()) {
          const fingers = fingering.split(",").length;
          assert.equal(strings, fingers);
        }
      }
    }
  });
});

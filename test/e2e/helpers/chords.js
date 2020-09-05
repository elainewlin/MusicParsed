import { assert } from "chai";
import { getAllHtmlForSelector} from "./browser"
export const checkChords = async (page, knownChords, unknownChords = []) => {
  // Assuming for tests that all unknown chords come first
  const allChords = [...unknownChords, ...knownChords];

  // Check chord names
  const chords = await getAllHtmlForSelector(page, ".chordName");
  assert.deepStrictEqual(chords, allChords);

  // Check chord images
  const svgs = await page.$$(".chordPics svg");
  assert.equal(svgs.length, knownChords.length);

  // Check unknown chords
  const unknown = await page.$$(".chordPics .chordUnknown");
  assert.equal(unknown.length, unknownChords.length);
};
import * as parser from "../parser";
import { assert } from "chai";
describe("slugify", () => {
  it("should kill all non-alphanumeric characters", () => {
    const string = "titl!@#$%^&*()'e";
    const result = parser.slugify(string);
    assert(result === "title");
  });

  it("should lower-case the string", () => {
    const string = "HELLO";
    const result = parser.slugify(string);
    assert(result === "hello");
  });

  it("should replace all spaces with underscore", () => {
    const string = "I have so many spaces!";
    const result = parser.slugify(string);
    assert(result === "i_have_so_many_spaces");
  });
});

describe("isLabel", () => {
  it("is false for empty line", () => {
    const line = "";
    assert.isFalse(parser.isLabel(line));
  });

  it("is true for label with colon", () => {
    const line = "Verse:";
    assert.isTrue(parser.isLabel(line));
  });

  it("is true for label with brackets", () => {
    const line = "[Verse]";
    assert.isTrue(parser.isLabel(line));
  });
  it("is false for  non-label", () => {
    const line = "Hello world!";
    assert.isFalse(parser.isLabel(line));
  });
});

describe("isChordLine", () => {
  it("is false for empty line", () => {
    const line = "";
    assert.isFalse(parser.isChordLine(line));
  });

  it("is true for basic chords", () => {
    const ROOT_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
    const ACCIDENTALS = ["bb", "𝄫", "b", "♭", "#", "♯", "x", "𝄪"];
    const minor = (chord: string): string => chord + "m";

    ROOT_NOTES.forEach(root => {
      assert.isTrue(parser.isChordLine(root));
      assert.isTrue(parser.isChordLine(minor(root)));

      ACCIDENTALS.forEach(accidental => {
        assert.isTrue(parser.isChordLine(root + accidental));
      });
    });
  });

  it("requires all words to be chords", () => {
    const validLines = ["A C", "Dm   C   Dm C"];
    validLines.forEach(line => assert.isTrue(parser.isChordLine(line)));
    const invalidLines = ["A carrot", "Apple"];
    invalidLines.forEach(line => assert.isFalse(parser.isChordLine(line)));
  });

  it("is true for chords with underscore", () => {
    assert.isTrue(parser.isChordLine("Dm_1 Caug_22222"));
  });

  it("is true for complex chords", () => {
    const complexChords = [
      "F/A",
      "Cmaj7",
      "Caug",
      "Bbsus2",
      "Dbdim",
      "Gadd9",
      "Dm",
      "Emadd9",
      "A7no3",
    ];
    complexChords.forEach(chord => assert.isTrue(parser.isChordLine(chord)));
    assert.isTrue(parser.isChordLine(complexChords.join(" ")));
  });
});

describe("isLyricLine", () => {
  it("is false for chord lines", () => {
    const chordLine = "Dm C F G";
    assert.isFalse(parser.isLyricLine(chordLine));
  });

  it("is false for label lines", () => {
    const labelLine = "Verse:";
    assert.isFalse(parser.isLyricLine(labelLine));
  });

  it("is true otherwise", () => {
    const lyrics = "I used to rule the world";
    assert.isTrue(parser.isLyricLine(lyrics));
  });
});

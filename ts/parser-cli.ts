/* eslint no-console: "off" */

import { parseLines } from "../lib/parser";
import fs from "fs";
import path from "path";

const textDir = path.resolve(__dirname, "..", "static", "data", "text");
const jsonDir = path.resolve(__dirname, "..", "static", "data", "json");

const fields = [
  "allChords",
  "artist",
  "fullName",
  "id",
  "lines",
  "title",
  "label",
  "chord",
  "lyrics",
];

const compare = function(a: unknown, b: unknown, path: string): void {
  if (typeof a !== typeof b) {
    console.log("wrong type", path, typeof a, typeof b);
    return;
  }
  if (typeof a === "object" && typeof b === "object") {
    const a1 = a as { [key: string]: unknown };
    const b1 = b as { [key: string]: unknown };
    for (const key of new Set([...Object.keys(a1), ...Object.keys(b1)])) {
      compare(a1[key], b1[key], `${path}.${key}`);
    }
  } else if (typeof a === "string" && typeof b === "string") {
    if (a !== b) {
      console.log("wrong string", path, a, b);
    }
  } else {
    console.log("what even are these?", path);
  }
};

fs.readdirSync(textDir).map(filename => {
  const m = /^(.*) - (.*)\.txt$/.exec(filename);
  if (m) {
    const [, title, artist] = m;

    const songText = fs.readFileSync(path.resolve(textDir, filename), {
      encoding: "utf-8",
    });
    const songData = parseLines({ title, artist, songText });

    const jsonPath = path.resolve(jsonDir, `${songData.id}.json`);
    const jsonData = JSON.parse(
      fs.readFileSync(jsonPath, { encoding: "utf-8" })
    );

    if (JSON.stringify(songData, fields) !== JSON.stringify(jsonData, fields)) {
      console.log(`Differences in ${songData.id}`);
      compare(songData, jsonData, "");
      console.log();
    }
  }
});

/* eslint no-console: "off" */

import { slugify, parseLines } from "../lib/parser";
import dotenv from "dotenv";
import fs from "fs";
import { MongoClient } from "mongodb";
import path from "path";

const textDir = path.resolve(__dirname, "..", "static", "data", "text");
const tagsDir = path.resolve(__dirname, "..", "static", "data", "tags");

dotenv.config();
const mongoUri = process.env.MONGO_URI;
const mongoDbName = process.env.MONGO_DB_NAME;

if (!mongoUri) throw new Error("Missing MONGO_URI");
if (!mongoDbName) throw new Error("Missing MONGO_DB_NAME");

const tags = fs
  .readdirSync(tagsDir)
  .map(filename => /^(.*)\.txt$/.exec(filename))
  .filter(m => m)
  .sort()
  .map(m => {
    const [filename, tag] = m!;
    const tagText = fs.readFileSync(path.resolve(tagsDir, filename), {
      encoding: "utf-8",
    });
    return [tag, [...tagText.match(/[^\n]+/g)!]];
  });

const songTags = new Map();
for (const [tag, ids] of tags) {
  for (const id of ids) {
    if (!songTags.has(id)) songTags.set(id, []);
    songTags.get(id).push(tag);
  }
}

(async () => {
  console.log("Connecting to MongoDB");
  const mongoClient = await MongoClient.connect(mongoUri, {
    useNewUrlParser: true,
  });
  try {
    const db = mongoClient.db(mongoDbName);

    console.log("Dropping database");
    await db.dropDatabase();

    let songId = 0;

    console.log("Populating songs");
    await db.createCollection("songs");
    await db.collection("songs").insertMany(
      fs
        .readdirSync(textDir)
        .sort()
        .map(filename => /^(.*) - (.*)\.txt$/.exec(filename))
        .filter(m => m)
        .map(m => {
          const [filename, title, artist] = m!;

          const songText = fs.readFileSync(path.resolve(textDir, filename), {
            encoding: "utf-8",
          });
          const songData = parseLines({ title, artist, songText });

          const id = songData.id!;
          const tags = songTags.has(id) ? songTags.get(id) : [];

          return {
            ...songData,
            _id: ++songId,
            tags,
            url: `/song/${slugify(songData.artist!)}/${slugify(
              songData.title!
            )}`,
          };
        })
    );

    console.log("Populating counters");
    await db.createCollection("counters");
    await db.collection("counters").insertOne({ _id: "songId", seq: songId });
  } finally {
    console.log("Closing connection");
    await mongoClient.close();
  }
})();

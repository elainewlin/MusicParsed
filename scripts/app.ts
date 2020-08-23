/* eslint no-console: "off" */

import retry from "async-retry";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import { MongoClient } from "mongodb";
import nunjucks from "nunjucks";
import path from "path";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";

dotenv.config();
const host = process.env.PORT ? undefined : "127.0.0.1";
const port = +(process.env.PORT || 5000);
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const mongoDbName = process.env.MONGO_DB_NAME || "musicparsed";

const dbPromise = (async () => {
  const mongoClient = await retry(
    () =>
      MongoClient.connect(mongoUri, {
        reconnectTries: Infinity,
        useNewUrlParser: true,
      }),
    { forever: true, maxTimeout: 30000 }
  );
  return mongoClient.db(mongoDbName);
})();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Compatibility with Jinja2 templates
const env = nunjucks.configure(path.resolve(__dirname, "../templates"), {
  express: app,
  watch: true,
});
app.set("view engine", "html");

const manifestPath = path.resolve(__dirname, "../static/dist/manifest.json");

// Provide the webpack manifest
let reloadManifest = true;
app.use((req, res, next) => {
  if (reloadManifest) {
    env.addGlobal("manifest", null);
    reloadManifest = false;
    fs.watch(manifestPath, { persistent: false }, () => {
      reloadManifest = true;
    });
  }
  if (
    ((env as unknown) as { getGlobal(name: string): unknown }).getGlobal(
      "manifest"
    ) === null
  ) {
    const manifest = JSON.parse(
      fs.readFileSync(manifestPath, { encoding: "utf-8" })
    );
    env.addGlobal("manifest", manifest);
  }
  next();
});

// Routes
app.get("/api/song", async (req, res) => {
  const db = await dbPromise;
  res.json(
    await db
      .collection("songs")
      .find({}, { projection: { artist: 1, id: 1, tags: 1, title: 1, url: 1 } })
      .toArray()
  );
});

app.post("/api/song", async (req, res) => {
  const db = await dbPromise;
  const query = {
    title: req.body.title,
    artist: req.body.artist,
    id: req.body.id,
  };
  await db
    .collection("songs")
    .updateOne(query, { $set: req.body }, { upsert: true });
  res.json(req.body);
});

app.delete("/api/song/:id", async (req, res) => {
  const db = await dbPromise;
  const query = {
    id: req.params.id,
  };
  await db.collection("songs").deleteOne(query);
  res.json("Deleted!");
});

app.post("/api/login", async (req, res) => {
  const db = await dbPromise;
  const {
    username,
    password: passwordInput
  } = req.body;

  const user = await db.collection("users").findOne({ username });
  if (!user) {
    return res.sendStatus(404);
  }
  const hash = user.passwordHash;
  bcrypt.compare(passwordInput, hash)
    .then((isValid: Boolean) => {
      if (isValid) {
        return res.send("Authorized!")
      } else {
        return res.sendStatus(404);
      }
    })
});

app.use("/static", express.static(path.resolve(__dirname, "../static")));

app.get(["/", "/all"], (req, res) => res.render("all_songs"));

app.get("/convert", (req, res) => res.render("convert"));

app.get("/import", (req, res) => res.render("import"));

app.get("/render", (req, res) => res.render("render_chords"));

app.get("/aus", (req, res) => res.render("aus"));

app.get("/guides", (req, res) => res.render("guides/index"));

app.get("/guides/:guide_type", (req, res) =>
  res.render(`guides/${req.params.guide_type}`)
);

app.get("/song/:artist/:title", (req, res) =>
  res.render("index", {
    title: req.params.title,
    artist: req.params.artist,
    transpose: req.query.transpose | 0,
  })
);

app.get("/edit", (req, res) => res.render("edit_songs"));

app.get("/login", (req, res) => res.render("login"));

const callback = (): void => {
  console.log(`Listening on port ${port}`);
};

// Start server
if (host === undefined) {
  app.listen(port, callback);
} else {
  app.listen(port, host, callback);
}

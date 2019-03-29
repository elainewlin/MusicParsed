/* eslint @typescript-eslint/no-var-requires: "off", no-console: "off" */

const escapeHtml = require("escape-html");
const express = require("express");
const fs = require("fs");
const nunjucks = require("nunjucks");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser"); 

const host = process.env.PORT ? undefined : "127.0.0.1";
const port = process.env.PORT || 5000;
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// Compatibility with Jinja2 templates
const env = nunjucks.configure("templates", { express: app });
app.set("view engine", "html");

// Compatibility with {{ url_for('static', filename='images/logo.svg') }}
// syntax from Flask
env.addGlobal("url_for", (endpoint, params) => {
  if (endpoint === "static") {
    return `/static/${params.filename}`;
  } else {
    throw `url_for: unknown endpoint ${endpoint}`;
  }
});

// Compatibility with {{ webpack["index.js"] }} syntax from Flask_WebpackExt
let manifest;
let reloadManifest = true;
env.addGlobal(
  "webpack",
  new Proxy(
    {},
    {
      get(target, name) {
        if (reloadManifest) {
          fs.watch("static/dist/manifest.json", { persistent: false }, () => {
            reloadManifest = true;
          });
          reloadManifest = false;
          manifest = JSON.parse(fs.readFileSync("static/dist/manifest.json"));
        }
        if (/\.css$/.test(name)) {
          return nunjucks.runtime.markSafe(
            `<link rel="stylesheet" href="${escapeHtml(manifest[name])}" />`
          );
        } else if (/\.js$/.test(name)) {
          return nunjucks.runtime.markSafe(
            `<script src="${escapeHtml(manifest[name])}"></script>`
          );
        } else {
          throw `Unknown webpack key ${name}`;
        }
      },
    }
  )
);

let uri = "mongodb://localhost:27017";
if (process.env.USE_PROD) {
  const user = process.env.MONGO_USER;
  const password = process.env.MONGO_PASSWORD;
  const clusterUri = process.env.MONGO_URI;
  uri = `mongodb+srv://${user}:${password}@${clusterUri}/test?retryWrites=true`;
} 

app.route("/allSongs").get(function(req, res) {
  const client = new MongoClient(uri, { useNewUrlParser: true });

  client.connect(err => {
    if (err) {
      throw err;
    }

    const db = client.db("test");
    db.collection("allSongs").find().toArray(function (err, result) {
      if (err) {
        throw err;
      }
      res.send(result);
    });
  });
});

app.route("/song/:id").get(function(req, res) {
  const songId = req.params.id;

  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    if (err) {
      throw err;
    }

    const db = client.db("test");
    db.collection("songs").findOne({"id": songId}, function (err, result) {
      if (err) {
        throw err;
      }
      res.send(result);
    });
  });
});

app.route("/chord/:instrument/:rootIndex/:type?").get(function (req, res) {
  const instrument = req.params.instrument;
  const rootIndex = parseInt(req.params.rootIndex);
  const type = req.params.type ? req.params.type : "";

  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    if (err) {
      throw err;
    }

    const db = client.db("test");
    const searchQuery = {
      "instrument": instrument, 
      "rootIndex": rootIndex, 
      "type": type
    };
    db.collection("chords").findOne(searchQuery, function (err, result) {
      if (err) {
        throw err;
      }
      res.send(result);
    });
  });
});

// Routes
app.use("/static", express.static("static"));

app.get(["/", "/all"], (req, res) => res.render("all_songs"));

app.get("/convert", (req, res) => res.render("convert"));

app.get("/import", (req, res) => res.render("import"));

app.get("/render", (req, res) => res.render("render_chords"));

app.get("/aus", (req, res) => res.render("aus"));

app.get("/guides", (req, res) => res.render("guides/index"));

app.get("/guides/:guide_type", (req, res) =>
  res.render(`guides/${req.params.guide_type}`)
);

app.get("/song/:artist/:title", (req, res) => {
  res.render("index", {
    title: req.params.title,
    artist: req.params.artist,
    transpose: req.query.transpose | 0,
  });
});

app.get("/edit", (req, res) => res.render("edit_songs"));

// Start server
app.listen(port, host, () => {
  console.log(`Listening on port ${port}`);
});

app.post("/addSong", (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    if (err) {
      throw err;
    }

    const db = client.db("test");
    const query = {
      "title": req.body.title,
      "artist": req.body.artist,
      "id": req.body.id
    };
    db.collection("songs").updateOne(query, {$set: req.body}, {upsert: true});
    res.send(req.body);
  });
});

app.post("/deleteSong/:id", (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    if (err) {
      throw err;
    }

    const db = client.db("test");
    const query = {
      "id": req.params.id
    };
    db.collection("songs").deleteOne(query);
    res.send("Deleted!");
  });
});
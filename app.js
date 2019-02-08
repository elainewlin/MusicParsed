/* eslint @typescript-eslint/no-var-requires: "off", no-console: "off" */

const express = require("express");
const fs = require("fs");
const nunjucks = require("nunjucks");

const host = process.env.PORT ? undefined : "127.0.0.1";
const port = process.env.PORT || 5000;

const app = express();

// Compatibility with Jinja2 templates
const env = nunjucks.configure("templates", { express: app, watch: true });
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

// Provide the webpack manifest
let reloadManifest = true;
app.use((req, res, next) => {
  if (reloadManifest) {
    env.addGlobal("manifest", null);
    reloadManifest = false;
    fs.watch("static/dist/manifest.json", { persistent: false }, () => {
      reloadManifest = true;
    });
  }
  if (env.getGlobal("manifest") === null) {
    const manifest = JSON.parse(fs.readFileSync("static/dist/manifest.json"));
    env.addGlobal("manifest", manifest);
  }
  next();
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

app.get("/song/:artist/:title", (req, res) =>
  res.render("index", {
    title: req.params.title,
    artist: req.params.artist,
    transpose: req.query.transpose | 0,
  })
);

// Start server
app.listen(port, host, () => {
  console.log(`Listening on port ${port}`);
});

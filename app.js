const escapeHtml = require("escape-html");
const express = require("express");
const fs = require("fs");
const nunjucks = require("nunjucks");

const host = process.env.PORT ? undefined : "127.0.0.1";
const port = process.env.PORT || 5000;

const app = express();

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
    transpose: req.query.transpose || 0,
  })
);

// Start server
app.listen(port, host, () => {
  console.log(`Listening on port ${port}`);
});

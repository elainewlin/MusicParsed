import retry from "async-retry";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import { get } from "lodash";
import nunjucks from "nunjucks";
import path from "path";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import expressSession from "express-session";
import flash from "connect-flash";
import { User } from "../models/user";
import UserModel from "../models/user";
import TagModel from "../models/tag";
import SongModel from "../models/song";
import { validateSignupInput, createUser } from "../services/signup";
import {
  loginLimiter,
  signupLimiter,
  createSongLimiter,
  apiLimiter,
} from "../services/rateLimit";
import { changeUserPassword } from "../services/password";

dotenv.config();
const host = process.env.PORT ? undefined : "127.0.0.1";
const port = +(process.env.PORT || 5000);
const baseUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const mongoDbName = process.env.MONGO_DB_NAME || "musicparsed";

// Connect to Mongo DB
(async () => {
  await retry(
    () =>
      mongoose.connect(baseUri, {
        dbName: mongoDbName,
        reconnectTries: Infinity,
        useNewUrlParser: true,
      }),
    { forever: true, maxTimeout: 30000 }
  );
  return mongoose.connection;
})();

const requireLogin = (req: any, res: any, next: Function) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect(`/login?fromUrl=${req.originalUrl}`);
  }
  next();
};

const requireAdmin = (req: any, res: any, next: Function) => {
  requireLogin(req, res, () => {
    if (!req.user.admin) {
      return res.redirect("/login");
    }
    next();
  });
};

const renderTemplate = (
  req: any,
  res: any,
  template: string,
  args: object = {}
) => {
  const messages = req.flash("messages");
  const errors = req.flash("errors");
  const warnings = req.flash("warnings");
  res.render(template, {
    messages,
    errors,
    warnings,
    ...args,
  });
};

const loginStrategy = (username: string, password: string, cb: Function) => {
  UserModel.findOne({ username }, (err: Error, user: User) => {
    if (err) return cb(err);
    if (!user) return cb(null, false);
    const hash = user.passwordHash;
    if (!hash) return cb(null, false);
    bcrypt.compare(password, hash, (err: Error, isValid: boolean) => {
      if (!isValid) return cb(null, false);
      return cb(null, user);
    });
  });
};
passport.use(new Strategy(loginStrategy));

passport.serializeUser((user: User, cb: Function) => {
  cb(null, user._id);
});

passport.deserializeUser((id: string, cb: Function) => {
  UserModel.findById(id, (err: Error, user: User) => {
    if (err) return cb(err);
    if (!user) return cb(null, false);
    cb(null, user);
  });
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessionKey = process.env.SESSION_KEY || "default-key";
app.use(
  expressSession({
    secret: sessionKey,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

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
  const songs = await SongModel.find({}).select({
    artist: 1,
    songId: 1,
    tagIds: 1,
    title: 1,
    url: 1,
  });
  const tags = await TagModel.find();
  res.json({ data: songs, included: { tags } });
});

app.get("/api/song/random", async (req, res) => {
  const song = await SongModel.aggregate([{ $sample: { size: 1 } }]);
  res.json({ data: song[0] });
});

app.get("/api/song/:songId", async (req, res) => {
  const { songId } = req.params;

  const song = await SongModel.findOne({ songId });
  res.json({ data: song });
});

app.post("/api/song", requireLogin, createSongLimiter, async (req, res) => {
  const userId = get(req, "user._id");
  if (!userId) {
    return res.json("No user ID found");
  }

  const { songId } = req.body;
  const song = await SongModel.findOne({ songId });
  if (song) {
    return res.json("Cannot add song that already exists");
  }

  const newSong = {
    ...req.body,
    userId,
  };
  await SongModel.create(newSong);
  res.send(`Added song ${req.body.title}`);
});

app.put("/api/song/:songId", requireLogin, apiLimiter, async (req, res) => {
  const userId = get(req, "user._id");
  if (!userId) {
    return res.json("No user ID found");
  }

  const { songId } = req.params;

  const query = {
    songId,
    userId,
  };
  const song = await SongModel.findOne(query);
  if (!song) {
    return res.json("No song found");
  }
  const updatedSong = {
    ...req.body,
    userId,
    lastUpdatedAt: new Date(),
  };
  await SongModel.updateOne(query, { $set: updatedSong });
  res.send(`Updated song ${req.body.title}`);
});

app.delete("/api/song/:songId", requireLogin, async (req, res) => {
  const userId = get(req, "user._id");
  if (!userId) {
    return res.json("No user ID found");
  }

  const { songId } = req.params;

  const query = {
    songId,
    userId,
  };
  const song = await SongModel.findOne(query);
  if (!song) {
    return res.json("No song found");
  }
  await SongModel.deleteOne(query);
  res.send("Deleted!");
});

app.post("/api/tag", requireAdmin, apiLimiter, async (req, res) => {
  const tagName = req.body.tag;
  if (!tagName) {
    return res.send("No tag name provided");
  }
  const tagQuery = { tagName };
  const tag = await TagModel.findOneAndUpdate(
    tagQuery,
    { $set: tagQuery },
    { upsert: true, new: true }
  );
  if (!tag) {
    return res.send("Failed to add tag");
  }
  const tagId = tag._id;

  const songIds = req.body.song_ids;
  if (!songIds) {
    return res.send("No song IDs provided");
  }

  const songIdArr = songIds.split("\r\n");
  const expectedCount = songIdArr.length;
  if (expectedCount === 0) {
    return res.send("Empty song ID array");
  }
  const songSearch = { songId: { $in: songIdArr } };
  const songResult = await SongModel.updateMany(songSearch, {
    $addToSet: { tagIds: tagId },
  });
  const modifiedCount = songResult.nModified;
  res.send(
    `Added tag ${tagName} to ${modifiedCount} of ${expectedCount} songs`
  );
});

app.post(
  "/api/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  loginLimiter,
  (req, res) => {
    const { fromUrl } = req.query;
    const redirect = fromUrl ? String(fromUrl) : "/song/edit";
    res.redirect(redirect);
  }
);

app.post("/api/password", loginLimiter, async (req, res) => {
  const handleError = (msg: string) => {
    req.flash("messages");
    req.flash("errors", msg);
    res.redirect("/password");
  };

  try {
    await changeUserPassword(req.user, req.body);
  } catch (err) {
    return handleError(err.message);
  }

  req.flash("messages", "Successfully reset password");
  res.redirect("/password");
});

app.post("/api/signup", signupLimiter, async (req, res) => {
  const handleError = (msg: string) => {
    req.flash("errors", msg);
    res.redirect("/signup");
  };

  let user;
  try {
    validateSignupInput(req.body);
    user = await createUser(req.body);
  } catch (err) {
    return handleError(err.message);
  }

  if (!user) {
    return handleError("Failed to create user");
  }

  req.login(user, err => {
    if (err) return handleError("Failed to login with new user");
    req.flash("messages", "User created - you can now add/edit songs");
    return res.redirect("/song/edit");
  });
});

app.use("/static", express.static(path.resolve(__dirname, "../static")));

app.get(["/", "/all"], (req, res) => res.render("all_songs"));

app.get("/tools/convert_tabs", (req, res) => res.render("tools/convert_tabs"));
app.get("/tools/render_chords", (req, res) =>
  res.render("tools/render_chords")
);

app.get("/guides", (req, res) => res.render("guides/index"));

app.get("/guides/:guide_type", (req, res) =>
  res.render(`guides/${req.params.guide_type}`)
);

app.get("/guides/songs/:guide_type", (req, res) =>
  res.render(`guides/songs/${req.params.guide_type}`)
);

app.get("/song/:artist/:title", (req, res) =>
  res.render("index", {
    title: req.params.title,
    artist: req.params.artist,
    transpose: req.query.transpose || 0,
  })
);

app.get("/song/edit", requireLogin, (req, res) => {
  renderTemplate(req, res, "edit_songs");
});

app.get("/tag/edit", requireAdmin, (req, res) => {
  res.render("edit_tags");
});

/***************/
/* USER ROUTES */
/***************/

app.get("/login", (req, res) => {
  let formAction = "/api/login";
  const { fromUrl } = req.query;
  if (fromUrl) {
    formAction += `?fromUrl=${fromUrl}`;
    req.flash("warnings", "You must log in to add/edit songs");
  }
  renderTemplate(req, res, "login", { formAction });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/password", requireLogin, (req, res) => {
  renderTemplate(req, res, "password");
});

app.get("/signup", (req, res) => {
  renderTemplate(req, res, "signup");
});

// ERROR PAGE
app.use((req, res) => {
  res.status(404);
  res.render("404", { url: req.url });
});

const callback = (): void => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${port}`);
};

// Start server
if (host === undefined) {
  app.listen(port, callback);
} else {
  app.listen(port, host, callback);
}

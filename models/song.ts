import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const songSchema = new mongoose.Schema({
  songId: String,
  fullName: String,
  artist: String,
  title: String,
  allChords: Array,
  lines: Array,
  capo: String,
  overrideAllChords: String,
  url: String,
  tagIds: Array,
  userId: ObjectId,
});

const SongModel = mongoose.model("Song", songSchema);

module.exports = SongModel;
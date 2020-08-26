import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const songSchema = new mongoose.Schema({
  songId: { type: String, unique: true, index: true, required: true },
  fullName: { type: String, required: true },
  artist: { type: String, required: true },
  title: { type: String, required: true },
  allChords: { type: [String] },
  lines: { type: Array, required: true },
  capo: String,
  overrideAllChords: [String],
  url: { type: String, required: true },
  tagIds: [ObjectId],
  userId: { type: ObjectId, required: true, index: true },
  lastUpdatedAt: { type: Date, default: Date.now },
});

const SongModel = mongoose.model("Song", songSchema);

export default SongModel;

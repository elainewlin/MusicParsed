import mongoose from "mongoose";

export interface Tag {
  _id: string;
  tagName: string;
}
const tagSchema = new mongoose.Schema({
  tagName: { type: String, unique: true },
});

const TagModel = mongoose.model("Tag", tagSchema);

export default TagModel;

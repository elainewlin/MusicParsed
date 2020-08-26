import mongoose from "mongoose";

export interface Tag {
  _id: string;
  tagName: string;
}
const tagSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  tagName: String,
});

const TagModel = mongoose.model("Tag", tagSchema);

export default TagModel;

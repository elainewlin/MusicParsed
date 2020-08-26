import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

export interface Tag {
  _id: string;
  tagName: string;
}
const tagSchema = new mongoose.Schema({
  _id: ObjectId,
  tagName: String,
});

const TagModel = mongoose.model("Tag", tagSchema);

export default TagModel;

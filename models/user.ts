import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

export interface User {
  _id: string;
  username: string;
  passwordHash: string;
  admin?: boolean;
}

const userSchema = new mongoose.Schema({
  _id: ObjectId,
  username: String,
  passwordHash: String,
  admin: Boolean,
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;

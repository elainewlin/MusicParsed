import mongoose from "mongoose";

export interface User {
  _id: string;
  username: string;
  passwordHash: string;
  admin?: boolean;
}

const userSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
  admin: Boolean,
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;

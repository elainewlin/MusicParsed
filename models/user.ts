import mongoose from "mongoose";

export interface User extends mongoose.Document {
  username?: string;
  passwordHash?: string;
  admin?: boolean;
}

const userSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  username: { type: String, unique: true, index: true, required: true },
  passwordHash: { type: String, required: true },
  admin: Boolean,
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;

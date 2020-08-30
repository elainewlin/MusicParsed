import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

export interface SignupToken extends mongoose.Document {
  userId?: string;
}

const SignupTokenSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  userId: { type: ObjectId },
});

const SECONDS_IN_DAY = 24 * 60 * 60;
SignupTokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: SECONDS_IN_DAY }
);

const SignupTokenModel = mongoose.model("SignupToken", SignupTokenSchema);

export default SignupTokenModel;

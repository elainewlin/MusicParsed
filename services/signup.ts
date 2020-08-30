import bcrypt from "bcrypt";
import UserModel from "../models/user";
import SignupTokenModel from "../models/signupToken";
import { SignupToken } from "../models/signupToken";

const isAlphaNumeric = (str: string) => str.match(/^[a-z0-9]+$/i);

const isValidNameLength = (str: string) => {
  const MIN_NAME_LENGTH = 2;
  const MAX_NAME_LENGTH = 20;
  return str.length >= MIN_NAME_LENGTH && str.length <= MAX_NAME_LENGTH;
};

const isValidPasswordLength = (str: string) => {
  const MIN_PASSWORD_LENGTH = 4;
  const MAX_PASSWORD_LENGTH = 30;
  return str.length >= MIN_PASSWORD_LENGTH && str.length <= MAX_PASSWORD_LENGTH;
};

const hasAllFields = (fields: string[]) => {
  for (const field of fields) {
    if (!field) return false;
  }
  return true;
};

interface SignupBody {
  username: string;
  password: string;
  signupToken: string;
}

export const validateUserInput = (body: SignupBody) => {
  const { username, password, signupToken } = body;

  if (!hasAllFields(Object.values(body))) {
    throw new Error("Missing required field");
  }

  if (!isAlphaNumeric(username)) {
    throw new Error("Username must only contain letters and numbers");
  }
  if (!isValidNameLength(username)) {
    throw new Error("Username must be between 2-20 characters");
  }

  if (!isValidPasswordLength(password)) {
    throw new Error("Password must be between 4-30 characters");
  }
};

const getSignupToken = async (signupToken: string) => {
  let tokenFromDB: SignupToken | null;
  try {
    tokenFromDB = await SignupTokenModel.findById(signupToken);
  } catch (err) {
    throw new Error("Invalid signup token");
  }

  if (!tokenFromDB) {
    throw new Error("Invalid signup token");
  }
  if (tokenFromDB.userId) {
    throw new Error("Signup token has already been used");
  }
  return tokenFromDB;
};

export const createUser = async (body: SignupBody) => {
  const { username, password, signupToken } = body;

  const tokenFromDB = await getSignupToken(signupToken);

  const SALT_ROUNDS = 10;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    throw new Error(`User with username ${username} already exists`);
  }
  const user = await UserModel.create({ username, passwordHash });

  // Mark signup token as used
  tokenFromDB.userId = user.id;
  await tokenFromDB.save();
};

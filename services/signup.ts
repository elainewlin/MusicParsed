import bcrypt from "bcrypt";
import UserModel from "../models/user";

const isAlphaNumeric = (str: string) => str.match(/^[a-z0-9]+$/i);

const isValidNameLength = (str: string) => {
  const MIN_NAME_LENGTH = 2;
  const MAX_NAME_LENGTH = 20;
  return str.length >= MIN_NAME_LENGTH && str.length <= MAX_NAME_LENGTH;
};

const isValidPasswordLength = (str: string) => {
  const MIN_PASSWORD_LENGTH = 6;
  const MAX_PASSWORD_LENGTH = 30;
  return str.length >= MIN_PASSWORD_LENGTH && str.length <= MAX_PASSWORD_LENGTH;
};

interface SignupBody {
  username: string;
  password: string;
  passwordConfirm: string;
}

export const validateUserSignup = (body: SignupBody) => {
  const { username, password, passwordConfirm } = body;

  if (!isAlphaNumeric(username)) {
    throw new Error("Username must only contain letters and numbers");
  }
  if (!isValidNameLength(username)) {
    throw new Error("Username must be between 2-20 characters");
  }

  if (password !== passwordConfirm) {
    throw new Error("Passwords do not match");
  }
  if (!isValidPasswordLength(password)) {
    throw new Error("Password must be between 6-30 characters");
  }
};

export const createUser = async (body: SignupBody) => {
  const { username, password } = body;

  const SALT_ROUNDS = 10;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    throw new Error(`User with username ${username} already exists`);
  }
  return UserModel.create({ username, passwordHash });
};

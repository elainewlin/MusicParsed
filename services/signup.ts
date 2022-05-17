import UserModel from "../models/user";
import { isValidPasswordLength, generatePassword } from "./password";

const isAlphaNumeric = (str: string) => str.match(/^[a-z0-9]+$/i);

const isValidNameLength = (str: string) => {
  const MIN_NAME_LENGTH = 2;
  const MAX_NAME_LENGTH = 20;
  return str.length >= MIN_NAME_LENGTH && str.length <= MAX_NAME_LENGTH;
};

export interface SignupBody {
  username?: string;
  password?: string;
}

export const validateSignupInput = (body: SignupBody) => {
  const { username, password } = body;

  if (!username || !password) {
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

export const createUser = async (body: SignupBody) => {
  const { username, password } = body;

  if (!username || !password) {
    throw new Error("Missing required field");
  }

  const existingUser = await UserModel.findOne({ username });
  if (existingUser) {
    throw new Error(`User with username ${username} already exists`);
  }

  const [passwordHash] = await generatePassword(password);
  const user = await UserModel.create({ username, passwordHash });

  return user;
};

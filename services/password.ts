import bcrypt from "bcrypt";
import UserModel from "../models/user";
import { User } from "../models/user";

export const isValidPasswordLength = (str: string) => {
  const MIN_PASSWORD_LENGTH = 4;
  const MAX_PASSWORD_LENGTH = 30;
  return str.length >= MIN_PASSWORD_LENGTH && str.length <= MAX_PASSWORD_LENGTH;
};

export const generatePassword = async (password: string) => {
  const SALT_ROUNDS = 10;
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const checkPassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash);

interface PasswordResetBody {
  username?: string;
  password?: string;
  newPassword?: string;
}

export const changeUserPassword = async (
  sessionUser: any,
  body: PasswordResetBody
) => {
  const { username, password, newPassword } = body;

  if (!username || !password || !newPassword) {
    throw new Error("Missing required field");
  }

  if (sessionUser.username !== username) {
    throw new Error("Cannot change password for other users");
  }

  if (!isValidPasswordLength(newPassword)) {
    throw new Error("New password must be between 4-30 characters");
  }

  const user: User | null = await UserModel.findOne({ username });
  if (!user || !user.passwordHash) {
    throw new Error(`Cannot find user with username ${username}`);
  }

  const isValid = await checkPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Incorrect password");
  }

  const newPasswordHash = await generatePassword(newPassword);

  // Reset password
  user.passwordHash = newPasswordHash;
  await user.save();
};

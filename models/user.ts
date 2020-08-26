import { ObjectID } from "mongodb";

export interface User {
  _id: ObjectID;
  username: string;
  passwordHash: string;
  admin?: boolean;
}

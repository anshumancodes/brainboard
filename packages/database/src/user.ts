import { Schema } from "mongoose";
import mongoose from "mongoose";
interface User {
  username: string;
  name: string;
  email: string;
  password: string;
}

const UserSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model<User>("User", UserSchema);

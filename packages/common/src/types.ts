import z from "zod";

export const UserSchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.email(),
  password: z.string(),
});

export const SignInSchema = z.object({
  username: z.string().min(4).max(21),
  password: z.string(),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(4).max(21),
});

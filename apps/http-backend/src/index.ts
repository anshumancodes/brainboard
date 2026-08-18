import express from "express";
import type { Request, Response } from "express";
import middleware from "./middlware.js";

const app = express();

app.listen(8000, () => {
  console.log("http server started at port 8000");
});

app.post("/signin", signIn);
app.post("/signup", signup);
app.post("/room", middleware, createRoom);

async function signup(req: Request, res: Response) {
  const { name, username, email, password } = req.body;
  // const doesExist=async User.findone({username:username});
  // if(doesExist){
  //     res.json({"message":"user with this username already exists"})
  // }
  return "sign up sucessfull";
}

async function signIn(req: Request, res: Response) {}

async function createRoom(params: string) {}

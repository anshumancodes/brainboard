import express from "express";
import roomRouter from "./routes/room.routes.js";
import userRouter from "./routes/user.routes.js";
const app = express();
app.use(express.json());

app.use("/room", roomRouter);
app.use("/user", userRouter);

app.listen(8000, () => {
  console.log("http server started at port 8000");
});

import express from "express";
import roomRouter from "./routes/room.routes.js";
import userRouter from "./routes/user.routes.js";
import cors from "cors";
import { ENVIROMENT, DEV_CORS_ORIGIN, PROD_CORS_ORIGIN } from "@repo/backend-common/config";
const app = express();

app.use(
  cors({
    origin: ENVIROMENT == "DEV" ? DEV_CORS_ORIGIN : PROD_CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/room", roomRouter);
app.use("/user", userRouter);

app.listen(8000, () => {
  console.log("http server started at port 8000");
});

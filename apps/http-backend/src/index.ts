import express from "express";

const app = express();

app.listen(8000, () => {
  console.log("http server started at port 8000");
});

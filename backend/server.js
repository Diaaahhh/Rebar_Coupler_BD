import dotenv from "dotenv";
dotenv.config();

import express from "express";

import cookieParser from "cookie-parser";
import cors from "cors";

import db from "./db.js";

const app = express();

app.use(express.json());
app.use(cookieParser()); 
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://frontend.rebarcouplerbd.com",
      "https://rebarcouplerbd.com",
    "https://www.rebarcouplerbd.com",
    ],
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );

db.query("SELECT 1")
  .then(() => {
    console.log("Database Connected!");
  })
  .catch((err) => {
    console.log("DB ERROR:", err);
  });

app.get("/", (req, res) => {
  res.send("Backend Running");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import userQueryRoutes from "./routes/userQueryRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import benefitRoutes from "./routes/benefitRoutes.js";
import aboutHomeRoutes from "./routes/aboutHomeRoutes.js";

const app = express();

app.use(express.json({ limit: "2mb" }));
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

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/about-us", aboutRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/article", articleRoutes);
app.use("/api/user-query", userQueryRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/benefits", benefitRoutes);
app.use("/api/about", aboutHomeRoutes);
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

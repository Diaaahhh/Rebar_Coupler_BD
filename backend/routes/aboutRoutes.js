import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads", "about");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (
      !file.mimetype.startsWith("image/") &&
      !allowedExtensions.includes(ext)
    ) {
      cb(new Error("Only image files are allowed"));
      return;
    }

    cb(null, true);
  },
});

function requireAdmin(req, res, next) {
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function imageUrl(req, imagePath) {
  if (!imagePath) {
    return null;
  }

  return `${req.protocol}://${req.get("host")}${imagePath}`;
}

async function getAbout(req) {
  const [rows] = await db.query(
    "SELECT id, description_html, image_path, updated_at FROM about_us WHERE id = 1 LIMIT 1"
  );

  const about = rows[0] || {
    id: 1,
    description_html: "<p>Write your company description from the admin panel.</p>",
    image_path: null,
    updated_at: null,
  };

  return {
    ...about,
    image_url: imageUrl(req, about.image_path),
  };
}

router.get("/", async (req, res) => {
  try {
    const about = await getAbout(req);
    res.json({ about });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { descriptionHtml } = req.body || {};

    if (!descriptionHtml) {
      return res.status(400).json({ message: "Description is required" });
    }

    const [existingRows] = await db.query(
      "SELECT image_path FROM about_us WHERE id = 1 LIMIT 1"
    );
    const oldImagePath = existingRows[0]?.image_path;
    const nextImagePath = req.file
      ? `/uploads/about/${req.file.filename}`
      : oldImagePath || null;

    await db.query(
      `
        INSERT INTO about_us
        (id, description_html, image_path)
        VALUES (1, ?, ?)
        ON DUPLICATE KEY UPDATE
          description_html = VALUES(description_html),
          image_path = VALUES(image_path)
      `,
      [descriptionHtml, nextImagePath]
    );

    if (req.file && oldImagePath) {
      const filePath = path.join(process.cwd(), oldImagePath.replace(/^\//, ""));
      fs.rm(filePath, { force: true }, () => {});
    }

    const about = await getAbout(req);
    res.json({ about });
  } catch (error) {
    if (req.file) {
      fs.rm(req.file.path, { force: true }, () => {});
    }

    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;

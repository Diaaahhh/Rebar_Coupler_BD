import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "hero");
fs.mkdirSync(uploadDir, { recursive: true });

/* -------------------------------------------------------
   Multer
------------------------------------------------------- */

const storage = multer.diskStorage({
  destination: uploadDir,

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

/* -------------------------------------------------------
   Admin Authentication
------------------------------------------------------- */

function verifyAdmin(req, res, next) {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}

/* =======================================================
   GET ALL HERO SLIDES
================================================------- */

router.get("/", async (req, res) => {
  try {
    const showAll = req.query.all === "true";
    const sql = showAll
      ? `
        SELECT *
        FROM hero_slides
        ORDER BY sort_order ASC, id ASC
      `
      : `
        SELECT *
        FROM hero_slides
        WHERE is_active = 1
        ORDER BY sort_order ASC, id ASC
      `;

    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("GET hero slides error:", err);
    return res.status(500).json({
      message: "Could not load hero slides.",
    });
  }
});

/* =======================================================
   CREATE HERO
================================================------- */

router.post(
  "/",
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const [countResult] = await db.query(
        "SELECT COUNT(*) total FROM hero_slides WHERE is_active=1"
      );

      if (countResult[0].total >= 5) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message: "Maximum 5 slides allowed.",
        });
      }

      const {
        title,
        subtitle,
        description,
        button_text,
        button_link,
        sort_order,
      } = req.body;

      if (!title || !req.file) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          message: "Title and image are required.",
        });
      }

      const image = `uploads/hero/${req.file.filename}`;

      const sql = `
        INSERT INTO hero_slides
        (
          title,
          subtitle,
          description,
          button_text,
          button_link,
          image,
          sort_order
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(sql, [
        title,
        subtitle || null,
        description || null,
        button_text || null,
        button_link || null,
        image,
        sort_order || 0,
      ]);

      res.json({
        message: "Hero slide created successfully.",
      });
    } catch (err) {
      console.error("POST hero slide error:", err);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({
        message: "Could not create slide.",
      });
    }
  }
);

/* =======================================================
   UPDATE HERO
================================================------- */

router.put(
  "/:id",
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const [rows] = await db.query(
        "SELECT * FROM hero_slides WHERE id=?",
        [id]
      );

      if (rows.length === 0) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({
          message: "Slide not found.",
        });
      }

      const oldSlide = rows[0];
      let image = oldSlide.image;

      if (req.file) {
        image = `uploads/hero/${req.file.filename}`;

        const oldImage = path.join(process.cwd(), oldSlide.image);

        if (fs.existsSync(oldImage)) {
          fs.unlinkSync(oldImage);
        }
      }

      const {
        title,
        subtitle,
        description,
        button_text,
        button_link,
        sort_order,
        is_active,
      } = req.body;

      if (!title) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          message: "Title is required.",
        });
      }

      const sql = `
        UPDATE hero_slides
        SET
          title=?,
          subtitle=?,
          description=?,
          button_text=?,
          button_link=?,
          image=?,
          sort_order=?,
          is_active=?
        WHERE id=?
      `;

      await db.query(sql, [
        title,
        subtitle || null,
        description || null,
        button_text || null,
        button_link || null,
        image,
        sort_order || 0,
        is_active !== undefined ? (is_active === "1" || is_active === 1 || is_active === true ? 1 : 0) : 1,
        id,
      ]);

      res.json({
        message: "Hero slide updated successfully.",
      });
    } catch (err) {
      console.error("PUT hero slide error:", err);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({
        message: "Could not update slide.",
      });
    }
  }
);

/* =======================================================
   DELETE HERO
================================================------- */

router.delete("/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM hero_slides WHERE id=?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Slide not found.",
      });
    }

    const slide = rows[0];
    const imagePath = path.join(process.cwd(), slide.image);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await db.query("DELETE FROM hero_slides WHERE id=?", [id]);

    res.json({
      message: "Hero slide deleted successfully.",
    });
  } catch (err) {
    console.error("DELETE hero slide error:", err);
    return res.status(500).json({
      message: "Could not delete slide.",
    });
  }
});

export default router;
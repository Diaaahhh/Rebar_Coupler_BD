import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads", "article");

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
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function imageUrl(req, imagePath) {
  if (!imagePath) {
    return null;
  }

  return `${req.protocol}://${req.get("host")}${imagePath}`;
}

function slugBase(title) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "article"
  );
}

async function articleSlug(title) {
  const base = slugBase(title);
  let slug = base;
  let counter = 2;

  while (true) {
    const [rows] = await db.query(
      "SELECT id FROM articles WHERE slug = ? AND id != 1 LIMIT 1",
      [slug]
    );

    if (rows.length === 0) {
      return slug;
    }

    slug = `${base}-${counter}`;
    counter += 1;
  }
}

async function getArticle(req) {
  const [rows] = await db.query(
    `
      SELECT
        id,
        slug,
        title_bn,
        title_en,
        content_bn_html,
        content_en_html,
        image_path,
        updated_at
      FROM articles
      WHERE id = 1
      LIMIT 1
    `
  );

  const article = rows[0] || {
    id: 1,
    slug: "rebar-coupler",
    title_bn: "রিবার কাপলার - Rebar Coupler",
    title_en: "Rebar Coupler",
    content_bn_html: "<p>বাংলা আর্টিকেল কনটেন্ট অ্যাডমিন প্যানেল থেকে লিখুন।</p>",
    content_en_html: "<p>Write the English article content from the admin panel.</p>",
    image_path: null,
    updated_at: null,
  };

  return {
    ...article,
    image_url: imageUrl(req, article.image_path),
  };
}

async function getArticleBySlug(slug, req) {
  const [rows] = await db.query(
    `
      SELECT
        id,
        slug,
        title_bn,
        title_en,
        content_bn_html,
        content_en_html,
        image_path,
        updated_at
      FROM articles
      WHERE slug = ?
      LIMIT 1
    `,
    [slug]
  );

  if (rows.length === 0) {
    return null;
  }

  return {
    ...rows[0],
    image_url: imageUrl(req, rows[0].image_path),
  };
}

function hasText(value) {
  return Boolean(value && value.replace(/<[^>]*>/g, "").trim());
}

async function translateText(text, targetLanguage) {
  if (!text.trim()) {
    return text;
  }

  const params = new URLSearchParams({
    client: "gtx",
    sl: "auto",
    tl: targetLanguage,
    dt: "t",
    q: text,
  });

  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Translation service is not available");
  }

  const data = await response.json();
  return (data[0] || []).map((item) => item[0]).join("");
}

async function translateHtml(html, targetLanguage) {
  const parts = html.split(/(<[^>]+>)/g);
  const translatedParts = [];

  for (const part of parts) {
    if (!part || part.startsWith("<")) {
      translatedParts.push(part);
      continue;
    }

    translatedParts.push(await translateText(part, targetLanguage));
  }

  return translatedParts.join("");
}

router.get("/", async (req, res) => {
  try {
    const article = await getArticle(req);
    res.json({ article });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/list", async (req, res) => {
  try {
    const [articles] = await db.query(
      `
        SELECT
          id,
          slug,
          title_bn,
          title_en,
          content_bn_html,
          content_en_html,
          image_path,
          updated_at
        FROM articles
        ORDER BY updated_at DESC
      `
    );

    res.json({
      articles: articles.map((article) => ({
        ...article,
        image_url: imageUrl(req, article.image_path),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const article = await getArticleBySlug(req.params.slug, req);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ article });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/translate", requireAdmin, async (req, res) => {
  try {
    const { text, targetLanguage, format = "text" } = req.body || {};

    if (!text || !["bn", "en"].includes(targetLanguage)) {
      return res
        .status(400)
        .json({ message: "Text and target language are required" });
    }

    if (!hasText(text)) {
      return res.json({ translatedText: text });
    }

    const translatedText =
      format === "html"
        ? await translateHtml(text, targetLanguage)
        : await translateText(text, targetLanguage);

    res.json({ translatedText });
  } catch (error) {
    console.error(error);
    res.status(502).json({ message: "Could not translate content right now" });
  }
});

router.put("/", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { titleBn, titleEn, contentBnHtml, contentEnHtml } = req.body || {};

    if (!titleBn || !titleEn || !contentBnHtml || !contentEnHtml) {
      return res.status(400).json({
        message: "Bangla title, English title, and both article contents are required",
      });
    }

    const [existingRows] = await db.query(
      "SELECT image_path FROM articles WHERE id = 1 LIMIT 1"
    );
    const oldImagePath = existingRows[0]?.image_path;
    const nextImagePath = req.file
      ? `/uploads/article/${req.file.filename}`
      : oldImagePath || null;
    const nextSlug = await articleSlug(titleEn);

    await db.query(
      `
        INSERT INTO articles
        (id, slug, title_bn, title_en, content_bn_html, content_en_html, image_path)
        VALUES (1, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          slug = VALUES(slug),
          title_bn = VALUES(title_bn),
          title_en = VALUES(title_en),
          content_bn_html = VALUES(content_bn_html),
          content_en_html = VALUES(content_en_html),
          image_path = VALUES(image_path)
      `,
      [
        nextSlug,
        titleBn,
        titleEn,
        contentBnHtml,
        contentEnHtml,
        nextImagePath,
      ]
    );

    if (req.file && oldImagePath) {
      const filePath = path.join(process.cwd(), oldImagePath.replace(/^\//, ""));
      fs.rm(filePath, { force: true }, () => {});
    }

    const article = await getArticle(req);
    res.json({ article });
  } catch (error) {
    if (req.file) {
      fs.rm(req.file.path, { force: true }, () => {});
    }

    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;

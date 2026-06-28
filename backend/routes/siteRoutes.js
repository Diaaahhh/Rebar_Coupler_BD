import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads", "site");

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
    files: 3,
    fileSize: 3 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico"];
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

function publicImageValue(req, imagePath, fallback = null) {
  if (!imagePath) {
    return fallback;
  }

  return imagePath.startsWith("/uploads/")
    ? imageUrl(req, imagePath)
    : imagePath;
}

function uploadedFile(req, fieldName) {
  return req.files?.[fieldName]?.[0] || null;
}

function removeUploadedPath(uploadPath) {
  if (!uploadPath?.startsWith("/uploads/site/")) {
    return;
  }

  const filePath = path.join(process.cwd(), uploadPath.replace(/^\//, ""));
  fs.rm(filePath, { force: true }, () => {});
}

async function getSettings(req) {
  
  const [rows] = await db.query(
    `
      SELECT
        id,
        logo_path,
        favicon_path,
        og_image_path,
        phone,
        site_title,
        seo_title,
        seo_description,
        seo_keywords,
        seo_tags,
        google_site_verification,
        pinterest_domain_verify,
        fb_app_id,
        updated_at
      FROM site_settings
      WHERE id = 1
      LIMIT 1
    `
  );

  const settings = rows[0] || {
    id: 1,
    logo_path: "/logo.png",
    favicon_path: null,
    og_image_path: null,
    phone: "09638-441144",
    site_title: "Rebar Coupler Bangladesh",
    seo_title: null,
    seo_description: null,
    seo_keywords: null,
    seo_tags: null,
    google_site_verification: null,
    pinterest_domain_verify: null,
    fb_app_id: null,
    updated_at: null,
  };

  return {
    ...settings,
    logo_url: publicImageValue(req, settings.logo_path, "/logo.png"),
    favicon_url: publicImageValue(req, settings.favicon_path, null),
    og_image_url: publicImageValue(req, settings.og_image_path, null),
  };
}

router.get("/settings", async (req, res) => {
  try {
    const settings = await getSettings(req);
    res.json({ settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put(
  "/settings",
  requireAdmin,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
    { name: "ogImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const [existingRows] = await db.query(
        `
          SELECT
            logo_path,
            favicon_path,
            og_image_path,
            phone,
            site_title,
            seo_title,
            seo_description,
            seo_keywords,
            seo_tags,
            google_site_verification,
            pinterest_domain_verify,
            fb_app_id
          FROM site_settings
          WHERE id = 1
          LIMIT 1
        `
      );
      const existing = existingRows[0] || {};
      const body = req.body || {};
      const fieldValue = (name, fallback) =>
        Object.prototype.hasOwnProperty.call(body, name) ? body[name] : fallback;
      const logoFile = uploadedFile(req, "logo");
      const faviconFile = uploadedFile(req, "favicon");
      const ogImageFile = uploadedFile(req, "ogImage");
      const nextLogoPath = logoFile
        ? `/uploads/site/${logoFile.filename}`
        : existing.logo_path || "/logo.png";
      const nextFaviconPath = faviconFile
        ? `/uploads/site/${faviconFile.filename}`
        : existing.favicon_path || null;
      const nextOgImagePath = ogImageFile
        ? `/uploads/site/${ogImageFile.filename}`
        : existing.og_image_path || null;

      await db.query(
        `
          INSERT INTO site_settings
          (
            id,
            logo_path,
            favicon_path,
            og_image_path,
            phone,
            site_title,
            seo_title,
            seo_description,
            seo_keywords,
            seo_tags,
            google_site_verification,
            pinterest_domain_verify,
            fb_app_id
          )
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            logo_path = VALUES(logo_path),
            favicon_path = VALUES(favicon_path),
            og_image_path = VALUES(og_image_path),
            phone = VALUES(phone),
            site_title = VALUES(site_title),
            seo_title = VALUES(seo_title),
            seo_description = VALUES(seo_description),
            seo_keywords = VALUES(seo_keywords),
            seo_tags = VALUES(seo_tags),
            google_site_verification = VALUES(google_site_verification),
            pinterest_domain_verify = VALUES(pinterest_domain_verify),
            fb_app_id = VALUES(fb_app_id)
        `,
        [
          nextLogoPath,
          nextFaviconPath,
          nextOgImagePath,
          fieldValue("phone", existing.phone || "09638-441144"),
          fieldValue("siteTitle", existing.site_title || "Rebar Coupler Bangladesh"),
          fieldValue("seoTitle", existing.seo_title || ""),
          fieldValue("seoDescription", existing.seo_description || ""),
          fieldValue("seoKeywords", existing.seo_keywords || ""),
          fieldValue("seoTags", existing.seo_tags || ""),
          fieldValue("googleSiteVerification", existing.google_site_verification || ""),
          fieldValue("pinterestDomainVerify", existing.pinterest_domain_verify || ""),
          fieldValue("fbAppId", existing.fb_app_id || ""),
        ]
      );

      if (logoFile) {
        removeUploadedPath(existing.logo_path);
      }

      if (faviconFile) {
        removeUploadedPath(existing.favicon_path);
      }

      if (ogImageFile) {
        removeUploadedPath(existing.og_image_path);
      }

      const settings = await getSettings(req);
      res.json({ settings });
    } catch (error) {
      for (const files of Object.values(req.files || {})) {
        for (const file of files) {
          fs.rm(file.path, { force: true }, () => {});
        }
      }

      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

export default router;

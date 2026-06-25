import express from "express";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

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

function getYouTubeId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function normalizeVideo(url) {
  const trimmedUrl = url.trim();
  const youtubeId = getYouTubeId(trimmedUrl);

  if (youtubeId) {
    return {
      video_url: trimmedUrl,
      embed_url: `https://www.youtube.com/embed/${youtubeId}`,
      thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }

  return {
    video_url: trimmedUrl,
    embed_url: trimmedUrl,
    thumbnail_url: null,
  };
}

router.get("/", async (req, res) => {
  try {
    const [videos] = await db.query(
      "SELECT id, title, video_url, embed_url, thumbnail_url, created_at FROM videos ORDER BY created_at DESC"
    );

    res.json({ videos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, videoUrl } = req.body || {};

    if (!title || !videoUrl) {
      return res.status(400).json({ message: "Title and video link are required" });
    }

    const normalizedVideo = normalizeVideo(videoUrl);

    const [result] = await db.query(
      `
        INSERT INTO videos
        (title, video_url, embed_url, thumbnail_url)
        VALUES (?, ?, ?, ?)
      `,
      [
        title.trim(),
        normalizedVideo.video_url,
        normalizedVideo.embed_url,
        normalizedVideo.thumbnail_url,
      ]
    );

    const [videos] = await db.query(
      "SELECT id, title, video_url, embed_url, thumbnail_url, created_at FROM videos WHERE id = ? LIMIT 1",
      [result.insertId]
    );

    res.status(201).json({ video: videos[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { title, videoUrl } = req.body || {};

    if (!title || !videoUrl) {
      return res.status(400).json({ message: "Title and video link are required" });
    }

    const normalizedVideo = normalizeVideo(videoUrl);

    const [result] = await db.query(
      `
        UPDATE videos
        SET title = ?,
            video_url = ?,
            embed_url = ?,
            thumbnail_url = ?
        WHERE id = ?
      `,
      [
        title.trim(),
        normalizedVideo.video_url,
        normalizedVideo.embed_url,
        normalizedVideo.thumbnail_url,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    const [videos] = await db.query(
      "SELECT id, title, video_url, embed_url, thumbnail_url, created_at FROM videos WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    res.json({ video: videos[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM videos WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({ message: "Video deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;

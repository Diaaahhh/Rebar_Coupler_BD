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

async function getSettings() {
  const [rows] = await db.query(
    "SELECT id, office_address, email, phone, whatsapp_number, facebook_url, youtube_url, map_embed_code FROM contact_settings WHERE id = 1 LIMIT 1"
  );

  return (
    rows[0] || {
      id: 1,
      office_address: "Office address will be updated from admin panel.",
      email: "info@example.com",
      phone: "09638-441144",
      whatsapp_number: "",
      facebook_url: "",
      youtube_url: "",
      map_embed_code: "",
    }
  );
}

router.get("/settings", async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/settings", requireAdmin, async (req, res) => {
  try {
    const {
      officeAddress,
      email,
      phone,
      whatsappNumber = "",
      facebookUrl = "",
      youtubeUrl = "",
      mapEmbedCode = "",
    } = req.body || {};

    if (!officeAddress || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Office address, email, and phone are required" });
    }

    await db.query(
      `
        INSERT INTO contact_settings
        (id, office_address, email, phone, whatsapp_number, facebook_url, youtube_url, map_embed_code)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          office_address = VALUES(office_address),
          email = VALUES(email),
          phone = VALUES(phone),
          whatsapp_number = VALUES(whatsapp_number),
          facebook_url = VALUES(facebook_url),
          youtube_url = VALUES(youtube_url),
          map_embed_code = VALUES(map_embed_code)
      `,
      [
        officeAddress,
        email,
        phone,
        whatsappNumber,
        facebookUrl,
        youtubeUrl,
        mapEmbedCode,
      ]
    );

    const settings = await getSettings();
    res.json({ settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const { fullName, phone, email = "", description } = req.body || {};

    if (!fullName || !phone || !description) {
      return res
        .status(400)
        .json({ message: "Full name, phone number, and description are required" });
    }

    await db.query(
      `
        INSERT INTO contact_messages
        (full_name, phone, email, description)
        VALUES (?, ?, ?, ?)
      `,
      [fullName, phone, email, description]
    );

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/messages", requireAdmin, async (req, res) => {
  try {
    const [messages] = await db.query(
      "SELECT id, full_name, phone, email, description, created_at FROM contact_messages ORDER BY created_at DESC"
    );

    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/messages/:id", requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM contact_messages WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: "Message deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;

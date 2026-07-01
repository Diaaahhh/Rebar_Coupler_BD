import express from "express";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

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
   GET FAQ
======================================================= */

router.get("/", async (req, res) => {
  try {
    const showAll = req.query.all === "true";

    const sql = showAll
      ? `
        SELECT *
        FROM faq
        ORDER BY sort_order ASC, id ASC
      `
      : `
        SELECT *
        FROM faq
        WHERE is_active=1
        ORDER BY sort_order ASC,id ASC
      `;

    const [rows] = await db.query(sql);

    res.json(rows);
  } catch (err) {
    console.error("GET FAQ error:", err);

    return res.status(500).json({
      message: "Could not load FAQ.",
    });
  }
});

/* =======================================================
   CREATE FAQ
======================================================= */

router.post("/", verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      question,
      answer,
      sort_order,
      is_active,
    } = req.body;

    if (!title || !question || !answer) {
      return res.status(400).json({
        message: "Title, question and answer are required.",
      });
    }

    const [count] = await db.query(
      "SELECT COUNT(*) total FROM faq WHERE is_active=1"
    );

    if (count[0].total >= 50) {
      return res.status(400).json({
        message: "Maximum 50 active FAQs allowed.",
      });
    }

    await db.query(
      `
      INSERT INTO faq
      (
        title,
        question,
        answer,
        sort_order,
        is_active
      )
      VALUES
      (?, ?, ?, ?, ?)
      `,
      [
        title,
        question,
        answer,
        sort_order || 0,
        is_active !== undefined
          ? (is_active == 1 || is_active === true)
            ? 1
            : 0
          : 1,
      ]
    );

    res.json({
      message: "FAQ created successfully.",
    });
  } catch (err) {
    console.error("POST FAQ error:", err);

    return res.status(500).json({
      message: "Could not create FAQ.",
    });
  }
});

/* =======================================================
   UPDATE FAQ
======================================================= */

router.put("/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM faq WHERE id=?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "FAQ not found.",
      });
    }

    const {
      title,
      question,
      answer,
      sort_order,
      is_active,
    } = req.body;

    if (!title || !question || !answer) {
      return res.status(400).json({
        message: "Title, question and answer are required.",
      });
    }

    await db.query(
      `
      UPDATE faq
      SET
        title=?,
        question=?,
        answer=?,
        sort_order=?,
        is_active=?
      WHERE id=?
      `,
      [
        title,
        question,
        answer,
        sort_order || 0,
        is_active !== undefined
          ? (is_active == 1 || is_active === true)
            ? 1
            : 0
          : 1,
        id,
      ]
    );

    res.json({
      message: "FAQ updated successfully.",
    });
  } catch (err) {
    console.error("PUT FAQ error:", err);

    return res.status(500).json({
      message: "Could not update FAQ.",
    });
  }
});

/* =======================================================
   DELETE FAQ
======================================================= */

router.delete("/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM faq WHERE id=?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "FAQ not found.",
      });
    }

    await db.query(
      "DELETE FROM faq WHERE id=?",
      [id]
    );

    res.json({
      message: "FAQ deleted successfully.",
    });
  } catch (err) {
    console.error("DELETE FAQ error:", err);

    return res.status(500).json({
      message: "Could not delete FAQ.",
    });
  }
});

export default router;
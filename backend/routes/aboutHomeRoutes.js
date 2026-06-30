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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}

/* =======================================================
   GET ABOUT HOME + CARDS
======================================================= */

router.get("/", async (req, res) => {
  try {
    const [homeRows] = await db.query(`
      SELECT
        id,
        text
      FROM about_home
      LIMIT 1
    `);

    const [cardRows] = await db.query(`
      SELECT
        id,
        icon,
        heading,
        sub_heading
      FROM about_cards
      ORDER BY id ASC
    `);

    res.json({
      home:
        homeRows.length > 0
          ? homeRows[0]
          : {
              id: null,
              text: "",
            },

      cards: cardRows,
    });
  } catch (err) {
    console.error("GET about error:", err);

    return res.status(500).json({
      message: "Could not load about section.",
    });
  }
});

/* =======================================================
   CREATE ABOUT CARD
======================================================= */

router.post("/", verifyAdmin, async (req, res) => {
  try {
    const {
      text,
      icon,
      heading,
      sub_heading,
    } = req.body;

    if (!text || !icon || !heading) {
      return res.status(400).json({
        message:
          "Text, icon and heading are required.",
      });
    }

    const [homeRows] = await db.query(
      "SELECT id FROM about_home LIMIT 1"
    );

    if (homeRows.length > 0) {
      await db.query(
        `
        UPDATE about_home
        SET
          text=?
        WHERE id=?
      `,
        [text, homeRows[0].id]
      );
    } else {
      await db.query(
        `
        INSERT INTO about_home
        (
          text
        )
        VALUES
        (?)
      `,
        [text]
      );
    }

    await db.query(
      `
      INSERT INTO about_cards
      (
        icon,
        heading,
        sub_heading
      )
      VALUES
      (?, ?, ?)
    `,
      [
        icon,
        heading,
        sub_heading || null,
      ]
    );

    res.json({
      message:
        "About card created successfully.",
    });
  } catch (err) {
    console.error("POST about error:", err);

    return res.status(500).json({
      message:
        "Could not create about card.",
    });
  }
});

/* =======================================================
   UPDATE ABOUT CARD
======================================================= */

router.put("/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const {
      text,
      icon,
      heading,
      sub_heading,
    } = req.body;

    if (!text || !icon || !heading) {
      return res.status(400).json({
        message:
          "Text, icon and heading are required.",
      });
    }

    const [cardRows] = await db.query(
      "SELECT * FROM about_cards WHERE id=?",
      [id]
    );

    if (cardRows.length === 0) {
      return res.status(404).json({
        message: "Card not found.",
      });
    }

    const [homeRows] = await db.query(
      "SELECT id FROM about_home LIMIT 1"
    );

    if (homeRows.length > 0) {
      await db.query(
        `
        UPDATE about_home
        SET
          text=?
        WHERE id=?
      `,
        [text, homeRows[0].id]
      );
    } else {
      await db.query(
        `
        INSERT INTO about_home
        (
          text
        )
        VALUES
        (?)
      `,
        [text]
      );
    }

    await db.query(
      `
      UPDATE about_cards
      SET
        icon=?,
        heading=?,
        sub_heading=?
      WHERE id=?
    `,
      [
        icon,
        heading,
        sub_heading || null,
        id,
      ]
    );

    res.json({
      message:
        "About card updated successfully.",
    });
  } catch (err) {
    console.error("PUT about error:", err);

    return res.status(500).json({
      message:
        "Could not update about card.",
    });
  }
});

/* =======================================================
   DELETE ABOUT CARD
======================================================= */

router.delete(
  "/:id",
  verifyAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      const [rows] = await db.query(
        "SELECT * FROM about_cards WHERE id=?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Card not found.",
        });
      }

      await db.query(
        "DELETE FROM about_cards WHERE id=?",
        [id]
      );

      res.json({
        message:
          "About card deleted successfully.",
      });
    } catch (err) {
      console.error("DELETE about error:", err);

      return res.status(500).json({
        message:
          "Could not delete about card.",
      });
    }
  }
);

export default router;
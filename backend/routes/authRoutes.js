import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

router.post(
  "/register",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            message:
              "All fields required",
          });
      }

      const [existing] =
        await db.query(
          `
          SELECT *
          FROM users
          WHERE email = ?
        `,
          [email]
        );

      if (
        existing.length > 0
      ) {
        return res
          .status(400)
          .json({
            message:
              "User already exists",
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      await db.query(
        `
        INSERT INTO users
        (
          name,
          email,
          password
        )
        VALUES
        (?, ?, ?)
      `,
        [
          email.split("@")[0],
          email,
          hashedPassword,
        ]
      );

      res.json({
        message:
          "Registration successful",
      });
    } catch (error) {
      console.error(error);

      res
        .status(500)
        .json({
          message:
            "Server Error",
        });
    }
  }
);
/*
POST /api/auth/login
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

   const isProduction =
  process.env.NODE_ENV === "production";

res.cookie("admin_token", token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  domain: isProduction
    ? ".rebarcouplerbd.com"
    : undefined,
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
}
);

    return res.status(200).json({
      success: true,
      message: "Welcome",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

/*
POST /api/auth/logout
*/
router.post("/logout", (req, res) => {
  
  res.clearCookie("admin_token", {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  domain: isProduction
    ? ".rebarcouplerbd.com"
    : undefined,
  path: "/",
});

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;
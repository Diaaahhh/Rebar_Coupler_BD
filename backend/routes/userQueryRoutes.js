import express from "express";
import axios from "axios";
import db from "../db.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| SMS Helper
|--------------------------------------------------------------------------
*/

async function sendSms(phone, message) {
  try {
    const smsApiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID;

    let formattedPhone = phone.trim();

    if (formattedPhone.startsWith("0")) {
      formattedPhone = `88${formattedPhone}`;
    }

    const url =
      `https://sms.iglweb.com/api/v1/send` +
      `?api_key=${smsApiKey}` +
      `&contacts=${formattedPhone}` +
      `&senderid=${senderId}` +
      `&msg=${encodeURIComponent(message)}`;

    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    console.error("SMS Error:", error?.response?.data || error.message);
    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Send OTP
|--------------------------------------------------------------------------
|
| POST /api/user-query/send-otp
|
*/

router.post("/send-otp", async (req, res) => {
  try {
    const {
      productId,
      fullName,
      email,
      phone,
    } = req.body || {};

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    if (!fullName?.trim()) {
      return res.status(400).json({
        message: "Full name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Check Product Exists
    |--------------------------------------------------------------------------
    */

    const [products] = await db.query(
      `
      SELECT id
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | OTP Limit
    |--------------------------------------------------------------------------
    |
    | Max 2 OTPs per phone per hour
    |
    */

    const [otpLimitRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM user_query
      WHERE phone = ?
      AND otp_sent_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `,
      [phone]
    );

    const total = Number(otpLimitRows[0]?.total || 0);

    if (total >= 2) {
      return res.status(429).json({
        message:
          "Maximum OTP limit reached. Please try again after one hour.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate OTP
    |--------------------------------------------------------------------------
    */

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    /*
    |--------------------------------------------------------------------------
    | Insert Query
    |--------------------------------------------------------------------------
    */

    const [result] = await db.query(
      `
      INSERT INTO user_query
      (
        product_id,
        full_name,
        email,
        phone,
        otp_code,
        otp_sent_at
      )
      VALUES
      (
        ?, ?, ?, ?, ?, NOW()
      )
      `,
      [
        productId,
        fullName.trim(),
        email.trim(),
        phone.trim(),
        otp,
      ]
    );

    const queryId = result.insertId;

    /*
    |--------------------------------------------------------------------------
    | Send OTP SMS
    |--------------------------------------------------------------------------
    */

    const smsMessage =
      `Your OTP for Rebar Coupler Bangladesh is ${otp}. ` +
      `This OTP is valid for 5 minutes.`;

    await sendSms(phone, smsMessage);

    return res.status(200).json({
      success: true,
      queryId,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Verify OTP
|--------------------------------------------------------------------------
|
| POST /api/user-query/verify-otp
|
*/

router.post("/verify-otp", async (req, res) => {
  try {
    const {
      queryId,
      otp,
    } = req.body || {};

    if (!queryId) {
      return res.status(400).json({
        message: "Query ID is required",
      });
    }

    if (!otp?.trim()) {
      return res.status(400).json({
        message: "OTP is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get Query
    |--------------------------------------------------------------------------
    */

    const [queryRows] = await db.query(
      `
      SELECT *
      FROM user_query
      WHERE id = ?
      LIMIT 1
      `,
      [queryId]
    );

    if (queryRows.length === 0) {
      return res.status(404).json({
        message: "Query not found",
      });
    }

    const query = queryRows[0];

    /*
    |--------------------------------------------------------------------------
    | Already Verified
    |--------------------------------------------------------------------------
    */

    if (query.otp_verified) {
      return res.status(400).json({
        message: "OTP already verified",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | OTP Match
    |--------------------------------------------------------------------------
    */

    if (query.otp_code !== otp.trim()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | OTP Expiry
    |--------------------------------------------------------------------------
    */

    const otpSentTime = new Date(query.otp_sent_at);
    const now = new Date();

    const diffMinutes =
      (now.getTime() - otpSentTime.getTime()) /
      (1000 * 60);

    if (diffMinutes > 5) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Mark Verified
    |--------------------------------------------------------------------------
    */

    await db.query(
      `
      UPDATE user_query
      SET otp_verified = 1
      WHERE id = ?
      `,
      [queryId]
    );

    /*
    |--------------------------------------------------------------------------
    | Get Product
    |--------------------------------------------------------------------------
    */

    const [products] = await db.query(
      `
      SELECT
        name,
        query_phone
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [query.product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = products[0];

    /*
    |--------------------------------------------------------------------------
    | Send Query Notification
    |--------------------------------------------------------------------------
    */

    const notificationMessage =
`New Product Query

Product: ${product.name}

Name: ${query.full_name}

Email: ${query.email}

Phone: ${query.phone}`;

    await sendSms(
      product.query_phone,
      notificationMessage
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
});

export default router;
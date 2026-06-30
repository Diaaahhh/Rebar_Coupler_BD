import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

/* ======================================================
   Upload Folder
====================================================== */

const uploadDir = path.join(process.cwd(), "uploads", "benefits");

fs.mkdirSync(uploadDir, {
  recursive: true,
});

/* ======================================================
   Multer Configuration
====================================================== */

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

/* ======================================================
   Verify Admin Middleware
====================================================== */

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
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}

/* ======================================================
   GET BENEFIT SECTION + BENEFITS
====================================================== */

router.get("/", async (req, res) => {
  try {
    const [sectionRows] = await db.query(`
      SELECT id, heading, subheading
      FROM benefit_section
      LIMIT 1
    `);

    const [benefitRows] = await db.query(`
      SELECT
        id,
        title,
        subtitle,
        icon,
        sort_order,
        is_active
      FROM benefits
      WHERE is_active=1
      ORDER BY sort_order,id
    `);

    res.json({
      section: sectionRows[0] || {
        heading: "",
        subheading: "",
      },
      benefits: benefitRows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* ======================================================
   CREATE BENEFIT
   POST /api/benefits
====================================================== */

router.post(
  "/",
  verifyAdmin,
  upload.single("icon"),
  async (req, res) => {
    try {
      const {
        heading,
        subheading,
        title,
        subtitle,
        sort_order,
      } = req.body;

      if (!heading || !title || !req.file) {
        if (req.file) fs.unlinkSync(req.file.path);

        return res.status(400).json({
          message: "Heading, title and icon are required.",
        });
      }

      const icon = `uploads/benefits/${req.file.filename}`;

      const [sectionRows] = await db.query(
        "SELECT id FROM benefit_section LIMIT 1"
      );

      if (sectionRows.length) {
        await db.query(
          `
          UPDATE benefit_section
          SET heading=?, subheading=?
          WHERE id=?
          `,
          [
            heading,
            subheading || null,
            sectionRows[0].id,
          ]
        );
      } else {
        await db.query(
          `
          INSERT INTO benefit_section
          (heading, subheading)
          VALUES (?, ?)
          `,
          [
            heading,
            subheading || null,
          ]
        );
      }

      await db.query(
        `
        INSERT INTO benefits
        (
          title,
          subtitle,
          icon,
          sort_order,
          is_active
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          title,
          subtitle || null,
          icon,
          sort_order || 0,
          1,
        ]
      );

      res.json({
        message: "Benefit created successfully.",
      });

    } catch (err) {
      console.error(err);

      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        message: "Server Error",
      });
    }
  }
);

/* ======================================================
   UPDATE BENEFIT
   PUT /api/benefits/:id
====================================================== */

router.put(
"/:id",
verifyAdmin,
upload.single("icon"),
async (req, res) => {

const { id } = req.params;

try {

const [rows] = await db.query(
"SELECT * FROM benefits WHERE id=?",
[id]
);

if(rows.length===0){

if(req.file){
fs.unlinkSync(req.file.path);
}

return res.status(404).json({
message:"Benefit not found."
});

}

const oldBenefit=rows[0];

let icon=oldBenefit.icon;

if(req.file){

icon=`uploads/benefits/${req.file.filename}`;

const oldImage=path.join(process.cwd(),oldBenefit.icon);

if(fs.existsSync(oldImage)){
fs.unlinkSync(oldImage);
}

}

const{
heading,
subheading,
title,
subtitle,
sort_order,
is_active
}=req.body;

if(!heading || !title){

if(req.file){
fs.unlinkSync(req.file.path);
}

return res.status(400).json({
message:"Heading and title are required."
});

}

const [sectionRows]=await db.query(
"SELECT id FROM benefit_section LIMIT 1"
);

if(sectionRows.length){

await db.query(
`
UPDATE benefit_section
SET
heading=?,
subheading=?
WHERE id=?
`,
[
heading,
subheading||null,
sectionRows[0].id
]
);

}else{

await db.query(
`
INSERT INTO benefit_section
(
heading,
subheading
)
VALUES
(?,?)
`,
[
heading,
subheading||null
]
);

}

await db.query(
`
UPDATE benefits
SET
title=?,
subtitle=?,
icon=?,
sort_order=?,
is_active=?
WHERE id=?
`,
[
title,
subtitle||null,
icon,
sort_order||0,
is_active!==undefined
? (is_active=="1" || is_active==1 || is_active===true ? 1 : 0)
: oldBenefit.is_active,
id
]
);

res.json({
message:"Benefit updated successfully."
});

}catch(err){

console.error("PUT benefit error:",err);

if(req.file){
fs.unlinkSync(req.file.path);
}

return res.status(500).json({
message:"Could not update benefit."
});

}

});

/* ======================================================
   DELETE BENEFIT
   DELETE /api/benefits/:id
====================================================== */

router.delete("/:id", verifyAdmin, async (req, res) => {

const { id } = req.params;

try {

const [rows]=await db.query(
"SELECT * FROM benefits WHERE id=?",
[id]
);

if(rows.length===0){

return res.status(404).json({
message:"Benefit not found."
});

}

const benefit=rows[0];

const imagePath=path.join(process.cwd(),benefit.icon);

if(fs.existsSync(imagePath)){
fs.unlinkSync(imagePath);
}

await db.query(
"DELETE FROM benefits WHERE id=?",
[id]
);

res.json({
message:"Benefit deleted successfully."
});

}catch(err){

console.error("DELETE benefit error:",err);

return res.status(500).json({
message:"Could not delete benefit."
});

}

});

export { upload, verifyAdmin };

export default router;
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads", "products");

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
    files: 5,
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
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function slugBase(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "product";
}

async function productSlug(name, excludeId = null) {
  const base = slugBase(name);
  let slug = base;
  let counter = 2;

  while (true) {
    const params = [slug];
    let query = "SELECT id FROM products WHERE slug = ?";

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    query += " LIMIT 1";

    const [rows] = await db.query(query, params);

    if (rows.length === 0) {
      return slug;
    }

    slug = `${base}-${counter}`;
    counter += 1;
  }
}

function imageUrl(req, imagePath) {
  if (!imagePath) {
    return null;
  }

  return `${req.protocol}://${req.get("host")}${imagePath}`;
}

async function getProductById(id, req) {
  const [products] = await db.query(
    `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.details_html,
        p.available_size,
p.quality_test,
p.pricing_system,
p.sample_test_system,
p.threading_forging,
        p.short_description_html,
        p.query_phone,
        p.seo_title,
        p.seo_description,
        p.seo_keywords,
        p.seo_tags,
        p.created_at,
        (
          SELECT image_path
          FROM product_images
          WHERE product_id = p.id
          ORDER BY is_main DESC, sort_order ASC, id ASC
          LIMIT 1
        ) AS main_image
      FROM products p
      WHERE p.id = ?
      LIMIT 1
    `,
    [id]
  );

  if (products.length === 0) {
    return null;
  }

  const product = products[0];
  const [images] = await db.query(
    `
      SELECT id, image_path, sort_order, is_main
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [id]
  );

  return {
    ...product,
    main_image_url: imageUrl(req, product.main_image),
    images: images.map((image) => ({
      ...image,
      image_url: imageUrl(req, image.image_path),
    })),
  };
}

async function getProductBySlug(slug, req) {
  const [products] = await db.query(
    `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.details_html,
        p.available_size,
p.quality_test,
p.pricing_system,
p.sample_test_system,
p.threading_forging,
        p.short_description_html,
        p.query_phone,
        p.seo_title,
        p.seo_description,
        p.seo_keywords,
        p.seo_tags,
        p.created_at,
        (
          SELECT image_path
          FROM product_images
          WHERE product_id = p.id
          ORDER BY is_main DESC, sort_order ASC, id ASC
          LIMIT 1
        ) AS main_image
      FROM products p
      WHERE p.slug = ?
      LIMIT 1
    `,
    [slug]
  );

  if (products.length === 0) {
    return null;
  }

  const product = products[0];
  const [images] = await db.query(
    `
      SELECT id, image_path, sort_order, is_main
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [product.id]
  );

  return {
    ...product,
    main_image_url: imageUrl(req, product.main_image),
    images: images.map((image) => ({
      ...image,
      image_url: imageUrl(req, image.image_path),
    })),
  };
}

router.get("/", async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.short_description_html,
        p.query_phone,
        p.seo_title,
        p.seo_description,
        p.seo_keywords,
        p.seo_tags,
        p.created_at,
        (
          SELECT image_path
          FROM product_images
          WHERE product_id = p.id
          ORDER BY is_main DESC, sort_order ASC, id ASC
          LIMIT 1
        ) AS main_image
      FROM products p
      ORDER BY p.created_at DESC
    `);

    res.json({
      products: products.map((product) => ({
        ...product,
        main_image_url: imageUrl(req, product.main_image),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug, req);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await getProductById(req.params.id, req);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", requireAdmin, upload.array("images", 5), async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      name,
      detailsHtml,
availableSize,
    qualityTest,
    pricingSystem,
    sampleTestSystem,
    threadingForging,
    shortDescriptionHtml,      queryPhone,
      seoTitle = "",
      seoDescription = "",
      seoKeywords = "",
      seoTags = "",
    } = req.body || {};
    const images = req.files || [];

    if (!name || !detailsHtml || !shortDescriptionHtml || !queryPhone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (images.length < 1 || images.length > 5) {
      return res
        .status(400)
        .json({ message: "Please upload 1 to 5 images" });
    }

    await connection.beginTransaction();
    const [result] = await connection.query(
      `
        INSERT INTO products
        (
          name,
          slug,
          details_html,
           available_size,
    quality_test,
    pricing_system,
    sample_test_system,
    threading_forging,
    short_description_html,
          query_phone,
          seo_title,
          seo_description,
          seo_keywords,
          seo_tags
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?, ?)
      `,
      [
        name,
        await productSlug(name),
        detailsHtml,   
availableSize,
    qualityTest,
    pricingSystem,
    sampleTestSystem,
    threadingForging,
        shortDescriptionHtml,
        queryPhone,
        seoTitle,
        seoDescription,
        seoKeywords,
        seoTags,
      ]
    );

    const productId = result.insertId;
    const imageRows = images.map((file, index) => [
      productId,
      `/uploads/products/${file.filename}`,
      index,
      index === 0 ? 1 : 0,
    ]);

    await connection.query(
      `
        INSERT INTO product_images
        (product_id, image_path, sort_order, is_main)
        VALUES ?
      `,
      [imageRows]
    );

    await connection.commit();

    const product = await getProductById(productId, req);
    res.status(201).json({ product });
  } catch (error) {
    await connection.rollback();

    for (const file of req.files || []) {
      fs.rm(file.path, { force: true }, () => {});
    }

    console.error(error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    connection.release();
  }
});

router.put("/:id", requireAdmin, upload.array("images", 5), async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      name,
      detailsHtml,
      availableSize,
    qualityTest,
    pricingSystem,
    sampleTestSystem,
    threadingForging,
      shortDescriptionHtml,
      queryPhone,
      seoTitle = "",
      seoDescription = "",
      seoKeywords = "",
      seoTags = "",
    } = req.body || {};
    const images = req.files || [];

    if (!name || !detailsHtml || !shortDescriptionHtml || !queryPhone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (images.length > 5) {
      return res
        .status(400)
        .json({ message: "Please upload no more than 5 images" });
    }

    const [existingProducts] = await connection.query(
      "SELECT id FROM products WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [oldImages] = await connection.query(
      "SELECT image_path FROM product_images WHERE product_id = ?",
      [req.params.id]
    );

    await connection.beginTransaction();

    const nextSlug = await productSlug(name, req.params.id);
console.log(req.body);

    await connection.query(
  `
  UPDATE products
  SET
      name = ?,
      slug = ?,
      details_html = ?,
      available_size = ?,
      quality_test = ?,
      pricing_system = ?,
      sample_test_system = ?,
      threading_forging = ?,
      short_description_html = ?,
      query_phone = ?,
      seo_title = ?,
      seo_description = ?,
      seo_keywords = ?,
      seo_tags = ?
  WHERE id = ?
  `,
  [
    name,
    nextSlug,
    detailsHtml,
    availableSize,
    qualityTest,
    pricingSystem,
    sampleTestSystem,
    threadingForging,
    shortDescriptionHtml,
    queryPhone,
    seoTitle,
    seoDescription,
    seoKeywords,
    seoTags,
    req.params.id,
  ]
);

    if (images.length > 0) {
      await connection.query("DELETE FROM product_images WHERE product_id = ?", [
        req.params.id,
      ]);

      const imageRows = images.map((file, index) => [
        req.params.id,
        `/uploads/products/${file.filename}`,
        index,
        index === 0 ? 1 : 0,
      ]);

      await connection.query(
        `
          INSERT INTO product_images
          (product_id, image_path, sort_order, is_main)
          VALUES ?
        `,
        [imageRows]
      );
    }

    await connection.commit();

    if (images.length > 0) {
      for (const image of oldImages) {
        const filePath = path.join(
          process.cwd(),
          image.image_path.replace(/^\//, "")
        );
        fs.rm(filePath, { force: true }, () => {});
      }
    }

    const product = await getProductById(req.params.id, req);
    res.json({ product });
  } catch (error) {
    await connection.rollback();

    for (const file of req.files || []) {
      fs.rm(file.path, { force: true }, () => {});
    }

    console.error(error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    connection.release();
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const connection = await db.getConnection();

  try {
    const [images] = await connection.query(
      "SELECT image_path FROM product_images WHERE product_id = ?",
      [req.params.id]
    );

    await connection.beginTransaction();
    await connection.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    await connection.commit();

    for (const image of images) {
      const filePath = path.join(process.cwd(), image.image_path.replace(/^\//, ""));
      fs.rm(filePath, { force: true }, () => {});
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    connection.release();
  }
});

export default router;

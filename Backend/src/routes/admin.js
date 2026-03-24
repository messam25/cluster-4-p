'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

// ─── GET /api/admin/products ──────────────────────────────────────────────────
// Returns all products (including inactive) for the admin panel.
router.get('/products', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id   AS id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.original_price AS originalPrice,
        p.image_url      AS image,
        p.badge_text     AS badgeText,
        p.badge_type     AS badgeType,
        p.inventory_qty  AS inventory,
        p.is_active      AS isActive,
        c.name           AS category,
        c.category_id    AS categoryId
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      ORDER BY p.product_id ASC
    `);
    return res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/categories ───────────────────────────────────────────────
router.get('/categories', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT category_id AS id, name FROM categories ORDER BY name ASC');
    return res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/products ─────────────────────────────────────────────────
// Add a new product.
router.post(
  '/products',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0.'),
    body('categoryId').isInt({ min: 1 }).withMessage('Valid category is required.'),
    body('image').optional().trim(),
    body('description').optional().trim(),
    body('originalPrice').optional({ nullable: true }).isFloat({ min: 0 }),
    body('inventory').optional().isInt({ min: 0 }),
    body('badgeText').optional().trim(),
    body('badgeType').optional().isIn(['primary', 'sale']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        name,
        price,
        categoryId,
        image = null,
        description = null,
        originalPrice = null,
        inventory = 0,
        badgeText = null,
        badgeType = null,
      } = req.body;

      // Auto-generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now();

      const [result] = await pool.query(
        `INSERT INTO products
           (category_id, name, slug, description, image_url, price, original_price,
            badge_text, badge_type, inventory_qty, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [categoryId, name, slug, description, image, price, originalPrice,
         badgeText || null, badgeType || null, inventory]
      );

      return res.status(201).json({ id: result.insertId, message: 'Product created.' });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/admin/products/:id ─────────────────────────────────────────────
// Update an existing product.
router.put(
  '/products/:id',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0.'),
    body('categoryId').isInt({ min: 1 }).withMessage('Valid category is required.'),
    body('image').optional().trim(),
    body('description').optional().trim(),
    body('originalPrice').optional({ nullable: true }).isFloat({ min: 0 }),
    body('inventory').optional().isInt({ min: 0 }),
    body('badgeText').optional().trim(),
    body('badgeType').optional().isIn(['primary', 'sale']),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const {
        name,
        price,
        categoryId,
        image = null,
        description = null,
        originalPrice = null,
        inventory = 0,
        badgeText = null,
        badgeType = null,
        isActive = true,
      } = req.body;

      const [check] = await pool.query('SELECT product_id FROM products WHERE product_id = ?', [id]);
      if (check.length === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      await pool.query(
        `UPDATE products
         SET category_id = ?, name = ?, description = ?, image_url = ?,
             price = ?, original_price = ?, badge_text = ?, badge_type = ?,
             inventory_qty = ?, is_active = ?
         WHERE product_id = ?`,
        [categoryId, name, description, image, price, originalPrice,
         badgeText || null, badgeType || null, inventory, isActive ? 1 : 0, id]
      );

      return res.json({ message: 'Product updated.' });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/products/:id ─────────────────────────────────────────-
// Soft-delete: sets is_active = 0.  Hard delete available too.
router.delete('/products/:id', auth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const [check] = await pool.query('SELECT product_id FROM products WHERE product_id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Hard delete — cart_items reference product_id ON DELETE SET NULL so it's safe
    await pool.query('DELETE FROM products WHERE product_id = ?', [id]);

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;

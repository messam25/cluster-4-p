'use strict';

const { Router } = require('express');
const pool = require('../db');

const router = Router();

// ─── GET /api/products ────────────────────────────────────────────────────────
// Optional query params: ?category=Footwear&sort=price_asc|price_desc|newest
// Response shape matches the frontend ShopProduct interface exactly.
router.get('/', async (req, res, next) => {
  try {
    const { category, sort } = req.query;

    let sql = `
      SELECT
        p.product_id,
        p.name,
        p.slug,
        p.price,
        p.original_price  AS originalPrice,
        p.image_url       AS image,
        p.badge_text,
        p.badge_type,
        c.name            AS category
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category && category !== 'All Categories') {
      sql += ' AND c.name = ?';
      params.push(category);
    }

    switch (sort) {
      case 'price_asc':
        sql += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY p.price DESC';
        break;
      case 'newest':
        sql += ' ORDER BY p.created_at DESC';
        break;
      default:
        sql += ' ORDER BY p.product_id ASC';
    }

    const [rows] = await pool.query(sql, params);

    const products = rows.map((p) => ({
      name: p.name,
      price: Number(p.price),
      category: p.category || '',
      image: p.image || '',
      badge: p.badge_text ? { text: p.badge_text, type: p.badge_type } : null,
      ...(p.originalPrice != null ? { originalPrice: Number(p.originalPrice) } : {}),
    }));

    return res.json(products);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

'use strict';

const { Router } = require('express');
const builder = require('xmlbuilder');
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
      id: p.product_id,
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

// ─── GET /api/products/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        p.product_id      AS id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.original_price  AS originalPrice,
        p.image_url       AS image,
        p.badge_text,
        p.badge_type,
        c.name            AS category
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      WHERE p.product_id = ? AND p.is_active = 1
    `;

    const [rows] = await pool.query(sql, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const p = rows[0];
    
    // Fallback descriptions in case DB update hasn't propagated
    const FALLBACK_DESCRIPTIONS = {
      'Kingston Trekker': 'A rugged, high-performance hiking boot designed for Jamaica\'s toughest trails. Features waterproof lining and superior grip.',
      'Blue Mountain Boots': 'Premium leather boots perfect for the misty peaks of the Blue Mountains. Durable, comfortable, and stylish.',
      'Negril Beach Tent': 'Lightweight, easy-to-assemble tent providing 50+ UPF protection. Ideal for long days on the white sands of Negril.',
      'Ocho Rios Rain Jacket': 'Ultra-lightweight and breathable waterproof shell. Keeps you dry during tropical downpours in the garden parish.',
      'Island Life Bottle': 'Double-walled vacuum insulated stainless steel bottle. Keeps your drinks ice-cold for 24 hours under the Caribbean sun.',
      'Montego Bay Lantern': 'High-lumen LED lantern with multiple light modes. Perfect for beach bonfires or mountain camping.',
      'Peak Gas Stove': 'Compact and efficient single-burner stove. Boiling water in minutes even at high altitudes.',
      'Multi-Tool Pro': '18-in-1 stainless steel multi-tool. Includes everything from wire cutters to a heavy-duty serrated blade.'
    };

    const product = {
      id: p.id,
      name: p.name,
      description: p.description || FALLBACK_DESCRIPTIONS[p.name] || 'No description available.',
      price: Number(p.price),
      category: p.category || '',
      image: p.image || '',
      badge: p.badge_text ? { text: p.badge_text, type: p.badge_type } : null,
      ...(p.originalPrice != null ? { originalPrice: Number(p.originalPrice) } : {}),
    };

    return res.json(product);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/products/feed.xml ──────────────────────────────────────────────
router.get('/feed.xml', async (req, res, next) => {
  try {
    const [products] = await pool.query(`
      SELECT 
        p.product_id AS id, 
        p.name, 
        p.price, 
        p.description, 
        p.image_url AS image,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      WHERE p.is_active = 1
    `);

    const xml = builder.create('products');

    products.forEach((p) => {
      const product = xml.ele('product');
      product.ele('id', p.id);
      product.ele('name', p.name);
      product.ele('category', p.category || 'Uncategorized');
      product.ele('price', Number(p.price).toFixed(2));
      product.ele('description', p.description || 'No description available.');
      product.ele('image', p.image || '');
    });

    res.set('Content-Type', 'text/xml');
    return res.send(xml.end({ pretty: true }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;

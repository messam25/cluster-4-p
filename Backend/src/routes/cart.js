'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

// All cart routes require a valid JWT
router.use(auth);

// ─── GET /api/cart ────────────────────────────────────────────────────────────
// Returns the authenticated user's active cart items, ordered by added_at DESC.
// Mirrors: db.collection('cart').orderBy('addedAt','desc').get()
router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Find the user's active cart (may not exist yet)
    const [carts] = await pool.query(
      "SELECT cart_id FROM carts WHERE user_id = ? AND status = 'active' LIMIT 1",
      [userId]
    );

    if (carts.length === 0) {
      return res.json([]);
    }

    const cartId = carts[0].cart_id;

    const [items] = await pool.query(
      `SELECT
         cart_item_id AS id,
         product_name_snapshot AS name,
         unit_price            AS price,
         category_snapshot     AS category,
         image_url_snapshot    AS image,
         quantity,
         added_at              AS addedAt
       FROM cart_items
       WHERE cart_id = ?
       ORDER BY added_at DESC`,
      [cartId]
    );

    // Coerce numeric types for JSON serialisation
    const result = items.map((i) => ({
      id: String(i.id),
      name: i.name,
      price: Number(i.price),
      category: i.category || '',
      image: i.image || '',
      quantity: i.quantity,
      addedAt: i.addedAt,
    }));

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/cart ───────────────────────────────────────────────────────────
// Adds a product to the cart.
// Mirrors: db.collection('cart').add({ name, price, category, image, addedAt })
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Product name is required.'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
    body('category').optional().trim(),
    body('image').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { name, price, category = '', image = '' } = req.body;

      // Find the product_id by name snapshot (best-effort; NULL if not found)
      const [products] = await pool.query(
        'SELECT product_id FROM products WHERE name = ? AND is_active = 1 LIMIT 1',
        [name]
      );
      const productId = products.length > 0 ? products[0].product_id : null;

      // Get or create the user's active cart
      let cartId;
      const [carts] = await pool.query(
        "SELECT cart_id FROM carts WHERE user_id = ? AND status = 'active' LIMIT 1",
        [userId]
      );

      if (carts.length > 0) {
        cartId = carts[0].cart_id;
      } else {
        const [created] = await pool.query(
          "INSERT INTO carts (user_id, status) VALUES (?, 'active')",
          [userId]
        );
        cartId = created.insertId;
      }

      // Upsert cart item (unique key: cart_id + product_id)
      if (productId !== null) {
        // Product-linked item: upsert on the unique key
        await pool.query(
          `INSERT INTO cart_items
             (cart_id, product_id, quantity, unit_price, product_name_snapshot, category_snapshot, image_url_snapshot)
           VALUES (?, ?, 1, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             quantity = quantity + 1,
             unit_price = VALUES(unit_price),
             product_name_snapshot = VALUES(product_name_snapshot),
             category_snapshot = VALUES(category_snapshot),
             image_url_snapshot = VALUES(image_url_snapshot)`,
          [cartId, productId, price, name, category, image]
        );
      } else {
        // Unknown product — insert without product_id (no unique constraint conflict)
        await pool.query(
          `INSERT INTO cart_items
             (cart_id, product_id, quantity, unit_price, product_name_snapshot, category_snapshot, image_url_snapshot)
           VALUES (?, NULL, 1, ?, ?, ?, ?)`,
          [cartId, price, name, category, image]
        );
      }

      return res.status(201).json({ message: `"${name}" added to cart.` });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/cart/checkout ────────────────────────────────────────────────
// Marks the active cart as 'converted' (checkout).
// Mirrors: batch.delete(...) for all cart items
// IMPORTANT: must be registered BEFORE /:id to avoid route clash
router.delete('/checkout', async (req, res, next) => {
  try {
    const { userId } = req.user;

    await pool.query(
      "UPDATE carts SET status = 'converted' WHERE user_id = ? AND status = 'active'",
      [userId]
    );

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/cart/:id ─────────────────────────────────────────────────────
// Removes a single cart item by cart_item_id.
// Mirrors: db.collection('cart').doc(id).delete()
router.delete('/:id', async (req, res, next) => {
  try {
    const { userId } = req.user;
    const itemId = Number(req.params.id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({ error: 'Invalid item id.' });
    }

    // Verify the item belongs to this user's active cart
    const [rows] = await pool.query(
      `SELECT ci.cart_item_id
       FROM cart_items ci
       JOIN carts c ON c.cart_id = ci.cart_id
       WHERE ci.cart_item_id = ? AND c.user_id = ? AND c.status = 'active'
       LIMIT 1`,
      [itemId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    await pool.query('DELETE FROM cart_items WHERE cart_item_id = ?', [itemId]);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;

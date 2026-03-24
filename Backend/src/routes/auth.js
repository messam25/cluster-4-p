'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const validate = require('../middleware/validate');

const router = Router();

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post(
  '/signup',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { fullName, email, password } = req.body;

      // Check duplicate email
      const [rows] = await pool.query(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );
      if (rows.length > 0) {
        return res.status(409).json({ error: 'Email is already registered.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const [result] = await pool.query(
        'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
        [fullName, email, passwordHash]
      );

      const userId = result.insertId;
      const token = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(201).json({
        token,
        user: { userId: Number(userId), fullName, email },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/signin ────────────────────────────────────────────────────
router.post(
  '/signin',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const [rows] = await pool.query(
        'SELECT user_id, full_name, email, password_hash, is_active FROM users WHERE email = ?',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = rows[0];

      if (!user.is_active) {
        return res.status(403).json({ error: 'Account is disabled.' });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { userId: Number(user.user_id), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({
        token,
        user: {
          userId: Number(user.user_id),
          fullName: user.full_name,
          email: user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const pool = require('../db');
const validate = require('../middleware/validate');

const router = Router();

// ─── POST /api/contact ────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('fullName').trim().notEmpty().escape().withMessage('Full name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('subject').trim().notEmpty().escape().withMessage('Subject is required.'),
    body('message').trim().isLength({ min: 5 }).escape().withMessage('Message is too short.'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { fullName, email, subject, message } = req.body;

      await pool.query(
        'INSERT INTO contact_messages (full_name, email, subject, message_body) VALUES (?, ?, ?, ?)',
        [fullName, email, subject, message]
      );

      return res.status(201).json({ message: 'Message received. We will get back to you soon!' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

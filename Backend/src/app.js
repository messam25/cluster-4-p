'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require('./routes/auth');
const cartRouter = require('./routes/cart');
const productsRouter = require('./routes/products');
const contactRouter = require('./routes/contact');
const adminRouter = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const frontendDistPath = path.resolve(__dirname, '../../Frontend/dist/cluster4p');
const frontendExists = fs.existsSync(frontendDistPath);

function setFrontendCacheHeaders(res, filePath) {
  const baseName = path.basename(filePath);
  const isHashedAsset = /\.[a-f0-9]{16}\./i.test(baseName);
  const isHtml = baseName.endsWith('.html');

  if (isHtml) {
    res.setHeader('Cache-Control', 'no-cache');
    return;
  }

  if (isHashedAsset) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return;
  }

  res.setHeader('Cache-Control', 'public, max-age=3600');
}

app.use(
  cors({
    origin: ['http://localhost:4200', 'http://localhost:4201'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(morgan('dev'));
app.use(express.json());

app.use('/uploads', express.static('uploads', { maxAge: '7d' }));

if (frontendExists) {
  app.use(
    express.static(frontendDistPath, {
      index: false,
      setHeaders: setFrontendCacheHeaders,
    })
  );
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/products', productsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);

if (frontendExists) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      next();
      return;
    }

    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use(errorHandler);

module.exports = app;

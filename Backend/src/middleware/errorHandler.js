'use strict';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  // Always log the real error server-side
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}`);
  console.error(err.stack || err);

  // In development return the real message so the browser console is useful
  const isDev = process.env.NODE_ENV !== 'production';
  const message = isDev ? (err.message || 'Internal server error.') : 'Internal server error.';
  res.status(status).json({ error: message });
}

module.exports = errorHandler;

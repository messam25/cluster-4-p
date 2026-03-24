-- Island Outdoor / JamGear
-- MySQL 8 schema for migrating away from Firebase Auth + Firestore.
--
-- Current Firebase usage mapped from the site:
-- 1. Firebase Auth user accounts
-- 2. Firestore users collection: fullName, email, createdAt
-- 3. Firestore cart collection: name, price, category, image, addedAt
-- 4. Hardcoded product catalog in shop.html
--
-- Notes:
-- - Store password hashes only. Do not store plain-text passwords.
-- - Prices use DECIMAL for currency safety.
-- - Cart items reference products, but also keep a snapshot for stability.

CREATE DATABASE IF NOT EXISTS island_outdoor
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE island_outdoor;

SET NAMES utf8mb4;

CREATE TABLE users (
  user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firebase_uid VARCHAR(128) NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_firebase_uid (firebase_uid)
) ENGINE=InnoDB;

CREATE TABLE categories (
  category_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_categories_name (name),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE products (
  product_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  description VARCHAR(255) NULL,
  image_url VARCHAR(500) NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NULL,
  badge_text VARCHAR(50) NULL,
  badge_type ENUM('primary', 'sale') NULL,
  inventory_qty INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  UNIQUE KEY uq_products_slug (slug),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_original_price CHECK (
    original_price IS NULL OR original_price >= price
  )
) ENGINE=InnoDB;

CREATE TABLE carts (
  cart_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  status ENUM('active', 'converted', 'abandoned') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (cart_id),
  UNIQUE KEY uq_active_cart_per_user (user_id, status),
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  cart_item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  product_name_snapshot VARCHAR(150) NOT NULL,
  category_snapshot VARCHAR(100) NULL,
  image_url_snapshot VARCHAR(500) NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cart_item_id),
  UNIQUE KEY uq_cart_product (cart_id, product_id),
  KEY idx_cart_items_cart_id (cart_id),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT chk_cart_items_quantity CHECK (quantity >= 1),
  CONSTRAINT chk_cart_items_unit_price CHECK (unit_price >= 0)
) ENGINE=InnoDB;

CREATE TABLE orders (
  order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  cart_id BIGINT UNSIGNED NULL,
  order_status ENUM('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')
    NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  placed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  KEY idx_orders_user_id (user_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_orders_cart
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT chk_orders_amounts CHECK (
    subtotal >= 0 AND tax_amount >= 0 AND shipping_amount >= 0 AND total_amount >= 0
  )
) ENGINE=InnoDB;

CREATE TABLE order_items (
  order_item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  product_name_snapshot VARCHAR(150) NOT NULL,
  category_snapshot VARCHAR(100) NULL,
  image_url_snapshot VARCHAR(500) NULL,
  line_total DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_item_id),
  KEY idx_order_items_order_id (order_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT chk_order_items_quantity CHECK (quantity >= 1),
  CONSTRAINT chk_order_items_prices CHECK (unit_price >= 0 AND line_total >= 0)
) ENGINE=InnoDB;

CREATE TABLE contact_messages (
  message_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  message_body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id)
) ENGINE=InnoDB;

INSERT INTO categories (name, slug) VALUES
  ('Hiking & Camping', 'hiking-camping'),
  ('Footwear', 'footwear'),
  ('Camping Gear', 'camping-gear'),
  ('Apparel', 'apparel'),
  ('Accessories', 'accessories'),
  ('Lighting', 'lighting'),
  ('Cooking', 'cooking')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO products (
  category_id,
  name,
  slug,
  description,
  image_url,
  price,
  original_price,
  badge_text,
  badge_type,
  inventory_qty
)
SELECT c.category_id, p.name, p.slug, p.description, p.image_url, p.price, p.original_price, p.badge_text, p.badge_type, p.inventory_qty
FROM (
  SELECT 'Hiking & Camping' AS category_name, 'Kingston Trekker' AS name, 'kingston-trekker' AS slug,
         NULL AS description, 'https://lh3.googleusercontent.com/aida-public/AB6AXuASOMTH5MhJVqNeJeGV24XYVal_FPiiGYOy63I-sMwQFHjmggjpOyegBZM6geajAfic79wn3Xil3__-L3t3XyXLKiBsPjHoKmie0mm3MCyzANsH0l1Ug0UJsVJp5Gs4_D7ecGC9Yl4AanodF39ixyGjiGRa6MfmErOMTK5fZFgoScsJJZcDZgZn8c_IDJA21Q6vj5PGYNJ1_c5ZO5D_xVKWXH4lUNnvv7uvMMUHn_uhtcKnbOcQmEXGt9uGW2BJfYitLKx4bSqm2LMW' AS image_url,
         120.00 AS price, NULL AS original_price, NULL AS badge_text, NULL AS badge_type, 25 AS inventory_qty
  UNION ALL
  SELECT 'Footwear', 'Blue Mountain Boots', 'blue-mountain-boots', NULL,
         'https://lh3.googleusercontent.com/aida-public/AB6AXuD25ytRN7A-UA7R-YHzJ6dZn2oPx58JJUdO1Xk2oWPiu6IGpjntcjAqzw_-ZRr2Dsxxapa-baAdPAqFviFvAQefdJKFbPYp5MjgQeJypH9YT7Bnj_NhgFLU7yusUyB9rvzZsYXUYqIkNm9swtyW2whOFjetmVzV0QS2PFi-Fp2qmUjovUfPa5oY7vttVZg1zTp6ejEE_B8stkucty6AAHi3Fyb9ziojBShLXN5HMz94k97vTWmK111ZMvXmFC3kIes6oW8gcP6wPo4G',
         145.00, NULL, NULL, NULL, 18
  UNION ALL
  SELECT 'Camping Gear', 'Negril Beach Tent', 'negril-beach-tent', NULL,
         'https://lh3.googleusercontent.com/aida-public/AB6AXuCIvEwZI8iEUL36pxjDsVlR5GWHozfhDeXbarHk34wmVxPRvpoXsyGRhzAILxPwllpu4B0TUesgnjRSfSJx67yb57Xsdj0VIriLRwV-4V06VI2_-VyCdsGLHA_KpoeAcDJAysrZulAngbhNmfF2kmUaeRkQLpX9XHREL6LsU9Hs5s8v8qdWiTZWpomQQ5IgVbg2o2G300AvEwH4f-368zBBfbZgC5g4MT1P2TYzDv-Xbq8bmM2JmIrFpd811SIZ5Ckt4EPqeaJFKklG',
         89.00, NULL, 'Best Seller', 'primary', 30
  UNION ALL
  SELECT 'Apparel', 'Ocho Rios Rain Jacket', 'ocho-rios-rain-jacket', NULL,
         'https://lh3.googleusercontent.com/aida-public/AB6AXuAMU9RgaImgt2cdLtezrN4eyig0KpRxSMGoiSR7cHLLHsuu8BwhD9DNKVVjVvrSUageAoCGvAwvCnoca1_L04pLleI0q0zFQ9OZ6NwxEA4ngly9Qe335m2lTHja-HuxwH64pgbECc0cH4kGlZ0yqMifigGw-McFCurDqPCPygAudAl4k9WoL0l6wAsbo7IoopfSJoNtCJru4SfjYqmKALzLbu-Npg7WmmQnoNMIql_TVnUyu6V1MaRTONb18tqOA8HELCzD1OKWbOzU',
         65.00, NULL, NULL, NULL, 16
  UNION ALL
  SELECT 'Accessories', 'Island Life Bottle', 'island-life-bottle', NULL,
         'https://lh3.googleusercontent.com/aida-public/AB6AXuAoBYCaSjyMEkFL_1Nfs10bvK-7tJI91fTQzQr9piLc9J0VEMM-ZY8-xLTgQffCGngzKFXx01ZnLQTxSY8OPurIl7PCX8IIKxf0k8u2MjAxEVYQ3PlK0nSDm7lsuXv_BfYf2l88N2BGpWQXvr-3sJnX4Wz0TPNx0JfzRVI43AZSL0VRa5tAPvanF84L8Y7qOo0yZ97a0b6IBq-mDxA_9oThihWg5RqCYa28EDY8mRytHIdiCprCim__ZDM5fAZbE7SCyE8_7N1fVJSf',
         32.00, NULL, NULL, NULL, 40
  UNION ALL
  SELECT 'Lighting', 'Montego Bay Lantern', 'montego-bay-lantern', NULL,
         'https://lh3.googleusercontent.com/aida-public/AB6AXuCaodw1a1ATowNuXEHnfWIYifTG6cZM5HzAjZ0Du9azYkvpHkfqhgpVfxo_w0f284Efy_bGWzvbnXrI_IVejs__X050zuOnqzVTJY0klNlukyybJD057gUmjfDJeT7625lL357OSxmvz5y9RcXSoXHeri1cLJziwD3NOy0cC5tZZRCwXdZr2hlkoii2VVt6t53Wmkl1TDM5YOa-_0LyM6Lo2w20jJK1f_MwXPbR5KI_rxEXlgzED6s41cOwTWiN2SIacoQSiYFP5vDK',
         45.00, 60.00, 'Sale', 'sale', 22
  UNION ALL
  SELECT 'Cooking', 'Peak Gas Stove', 'peak-gas-stove', NULL,
         'https://lh3.googleusercontent.com/aida-public/AB6AXuB4c3D0wAZaTnobrLN1NihZhjF4O-VSfltU5GVP06mPDV7FKQGCJbSAsNovy7MRrUUGMNlnur5-7Itnd1tndBYA4s5BU1RJCu-bleyMJxl4iD_5OWpWbrYxCqjxqdoZnE7rYljIl0gt0yhfjpc9V39x8vPszps_1Xeo-qJCCt-199nJtRbt9TfQYDc_ezcjYav8E2q88Pjq-g3S_0CW0sR4nvaUH59GrZvXBbIl_owvDjTUz6b0xs1uZdRPvEIR7xAPzZ_iEYSP7l_L',
         55.00, NULL, NULL, NULL, 14
  UNION ALL
  SELECT 'Accessories', 'Multi-Tool Pro', 'multi-tool-pro', NULL,
         'https://lh3.googleusercontent.com/aida-public/AB6AXuByt6xBzsTpMIlyL9qmGpXcWMASJWUU-uMZvXbyi2Sj1859KyuKSt4Fuba6Ykv8PPU-NuwJaiuD4HWquuMmGy6TWpZttxWgIMbKgLpaHQ4kQcrayUT4ZuY7O4_mtYGiNhZ52tGd0R6kfRyqn5rwZVBtXamI2PDBrVKRGXStapXT6ECqOahFDy3n-rMmE_6vuFXO71r2R70ZqePEP0jped8cVh2ozZu6VxWdiFY1XhVLC3lu_q9NeBHGaW-eAEtUDFpo-yDNrvjO53_i',
         42.00, NULL, NULL, NULL, 35
) AS p
JOIN categories AS c
  ON c.name = p.category_name
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  image_url = VALUES(image_url),
  price = VALUES(price),
  original_price = VALUES(original_price),
  badge_text = VALUES(badge_text),
  badge_type = VALUES(badge_type),
  inventory_qty = VALUES(inventory_qty),
  category_id = VALUES(category_id);

-- Optional migration notes:
-- Firebase users collection      -> users
-- Firebase Auth UID              -> users.firebase_uid
-- Firestore cart documents       -> carts + cart_items
-- Hardcoded shop catalog         -> products
-- Contact form submissions       -> contact_messages

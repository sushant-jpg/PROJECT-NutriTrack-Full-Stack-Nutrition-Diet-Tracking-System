CREATE DATABASE IF NOT EXISTS nutritrack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nutritrack;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  fullname VARCHAR(120) NOT NULL,
  username VARCHAR(30) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  joined DATE NOT NULL DEFAULT (CURRENT_DATE),
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  allocation VARCHAR(80) NOT NULL DEFAULT 'Standard',
  calories_goal INT UNSIGNED NOT NULL DEFAULT 2000,
  protein_goal DECIMAL(8,2) UNSIGNED NOT NULL DEFAULT 90.00,
  carbs_goal DECIMAL(8,2) UNSIGNED NOT NULL DEFAULT 250.00,
  fat_goal DECIMAL(8,2) UNSIGNED NOT NULL DEFAULT 65.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_status (status),
  KEY idx_users_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_username (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS meals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  food_name VARCHAR(160) NOT NULL,
  quantity DECIMAL(10,2) UNSIGNED NOT NULL,
  unit VARCHAR(40) NOT NULL,
  meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
  calories DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0,
  protein DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0,
  carbs DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0,
  fat DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0,
  occurred_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_meals_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  KEY idx_meals_user_occurred (user_id, occurred_at),
  KEY idx_meals_occurred_at (occurred_at),
  KEY idx_meals_type (meal_type)
) ENGINE=InnoDB;

-- JWT session IDs enable immediate server-side logout invalidation.
-- Principal identity is role-qualified because users/admins have separate tables.
CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  principal_id BIGINT UNSIGNED NOT NULL,
  role ENUM('user', 'admin') NOT NULL,
  expires_at BIGINT UNSIGNED NOT NULL,
  KEY idx_sessions_principal (role, principal_id),
  KEY idx_sessions_expiry (expires_at)
) ENGINE=InnoDB;

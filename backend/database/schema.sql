CREATE DATABASE IF NOT EXISTS `alumni_postcards` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `alumni_postcards`;

CREATE TABLE IF NOT EXISTS `templates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `slogan` VARCHAR(255) DEFAULT NULL,
  `logo_path` VARCHAR(255) DEFAULT NULL,
  `logo_url` VARCHAR(255) DEFAULT NULL,
  `background_path` VARCHAR(255) DEFAULT NULL,
  `aspect_ratio` VARCHAR(20) DEFAULT '3:4',
  `photo_area` JSON NOT NULL,
  `logo_position` VARCHAR(20) DEFAULT 'top-left',
  `canvas_width` INT DEFAULT 1080,
  `canvas_height` INT DEFAULT 1440,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `gallery_photos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `college` VARCHAR(120) NOT NULL,
  `class_name` VARCHAR(120) DEFAULT NULL,
  `graduation_year` VARCHAR(8) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `preview_path` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_college_year_class` (`college`, `class_name`, `graduation_year`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `generation_stats` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` INT UNSIGNED DEFAULT NULL,
  `college` VARCHAR(120) DEFAULT NULL,
  `graduation_year` VARCHAR(8) DEFAULT NULL,
  `event` ENUM('generate', 'download') NOT NULL,
  `download_count` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_template` (`template_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

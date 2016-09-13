/*
Navicat MySQL Data Transfer

Source Server         : muare
Source Server Version : 50505
Source Host           : localhost:3306
Source Database       : nodejs

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2016-09-13 16:14:49
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for apt_product
-- ----------------------------
DROP TABLE IF EXISTS `apt_product`;
CREATE TABLE `apt_product` (
  `id` int(50) NOT NULL,
  `name` varchar(100) COLLATE utf8_vietnamese_ci NOT NULL,
  `category_id` int(11) NOT NULL,
  `images_path` varchar(350) COLLATE utf8_vietnamese_ci NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `model` varchar(50) COLLATE utf8_vietnamese_ci NOT NULL,
  `quantity` int(10) NOT NULL,
  `promotion_id` int(10) NOT NULL,
  `brand_id` int(10) NOT NULL,
  `status` int(1) NOT NULL,
  `date_added` date NOT NULL,
  `date_modified` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_vietnamese_ci;

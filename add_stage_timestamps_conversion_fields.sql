-- SQL script to add tracking columns for lead stages and conversions
ALTER TABLE `leads`
  ADD COLUMN `stage_timestamps` JSON NULL AFTER `stage`;

ALTER TABLE `customers`
  ADD COLUMN `stage_timestamps` JSON NULL AFTER `vcardId`,
  ADD COLUMN `converted_at` DATETIME NULL AFTER `stage_timestamps`,
  ADD COLUMN `lead_created_at` DATETIME NULL AFTER `converted_at`;

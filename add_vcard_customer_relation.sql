-- SQL script to relate customers and leads to vcards
ALTER TABLE `customers`
  ADD COLUMN `vcardId` INT NULL AFTER `notes`,
  ADD CONSTRAINT `fk_customers_vcard` FOREIGN KEY (`vcardId`) REFERENCES `vcards`(`id`) ON DELETE SET NULL;

ALTER TABLE `leads`
  ADD COLUMN `vcardId` INT NULL AFTER `notes`,
  ADD CONSTRAINT `fk_leads_vcard` FOREIGN KEY (`vcardId`) REFERENCES `vcards`(`id`) ON DELETE SET NULL;

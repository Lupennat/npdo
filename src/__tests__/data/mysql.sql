CREATE DATABASE IF NOT EXISTS test_db;
USE test_db;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;
CREATE TABLE `test_db`.`users` (`id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,`name` VARCHAR(255) NOT NULL,`gender` VARCHAR(255) NOT NULL,PRIMARY KEY (`id`));
CREATE TABLE `test_db`.`companies` (`id` INT UNSIGNED NOT NULL AUTO_INCREMENT,`name` VARCHAR(255) NULL,PRIMARY KEY (`id`));
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Edmund","Multigender");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Kyleigh","Cis man");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Josefa","Cisgender male");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Cecile","Agender");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Sincere","Demi-girl");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Baron","Cisgender male");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Mckayla","Genderflux");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Wellington","Cisgender woman");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Tod","Demi-man");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Jeffrey","Androgyne");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Keenan","Two-spirit person");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Lucile","Man");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Kyra","Other");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Jermain","Gender neutral");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Kelli","Agender");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Jeffry","Two-spirit person");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Dawn","Male to female");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Ofelia","Cis female");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Icie","F2M");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Matilde","Trans");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Marcelina","Transgender female");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Destin","Male to female transsexual woman");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Reilly","Intersex man");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Casimer","Other");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Carli","Bigender");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Harry","Cis man");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Ellie","Omnigender");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Solon","Gender neutral");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Lesley","Cis");
INSERT INTO `test_db`.`users` (`name`, `gender`) VALUES ("Nikolas","Agender");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Satterfield Inc");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Grimes - Reinger");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Skiles LLC");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("White, Hermiston and Kihn");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Huel LLC");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Aufderhar - Schroeder");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Powlowski - VonRueden");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Murray - Hagenes");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Bednar LLC");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Kirlin - Bednar");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Kassulke - Auer");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Orn - Pouros");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Greenfelder - Paucek");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Hand, Effertz and Shields");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Harber - Heidenreich");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Greenholt - Durgan");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Hauck - Murazik");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Beier and Sons");
INSERT INTO `test_db`.`companies` (`name`) VALUES ("Harvey Inc");

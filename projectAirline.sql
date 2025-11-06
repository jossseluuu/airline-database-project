-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: projectAirline
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Airbus`
--

DROP TABLE IF EXISTS `Airbus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Airbus` (
  `airbusID` int NOT NULL AUTO_INCREMENT,
  `aircraftID` int DEFAULT NULL,
  `series` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`airbusID`),
  UNIQUE KEY `aircraftID` (`aircraftID`),
  CONSTRAINT `Airbus_ibfk_1` FOREIGN KEY (`aircraftID`) REFERENCES `Aircraft` (`aircraftID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Airbus`
--

LOCK TABLES `Airbus` WRITE;
/*!40000 ALTER TABLE `Airbus` DISABLE KEYS */;
/*!40000 ALTER TABLE `Airbus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Aircraft`
--

DROP TABLE IF EXISTS `Aircraft`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Aircraft` (
  `aircraftID` int NOT NULL AUTO_INCREMENT,
  `aircraftNumber` varchar(10) NOT NULL,
  `aircraftModel` varchar(100) NOT NULL,
  `manufacturer` varchar(35) NOT NULL,
  `yearOfManufacture` year NOT NULL,
  `seatingCapacity` int NOT NULL,
  `cargoCapacity` int NOT NULL,
  `status` enum('On-Duty','Maintenance','Retired') NOT NULL,
  `lastMaintenance` date DEFAULT NULL,
  `nextMaintenance` date DEFAULT NULL,
  `assignedBaseAirport` int NOT NULL,
  PRIMARY KEY (`aircraftID`),
  UNIQUE KEY `aircraftNumber` (`aircraftNumber`),
  KEY `assignedBaseAirport` (`assignedBaseAirport`),
  CONSTRAINT `Aircraft_ibfk_1` FOREIGN KEY (`assignedBaseAirport`) REFERENCES `Airport` (`airportID`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Aircraft`
--

LOCK TABLES `Aircraft` WRITE;
/*!40000 ALTER TABLE `Aircraft` DISABLE KEYS */;
/*!40000 ALTER TABLE `Aircraft` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Airport`
--

DROP TABLE IF EXISTS `Airport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Airport` (
  `airportID` int NOT NULL AUTO_INCREMENT,
  `airportIATACode` char(4) NOT NULL,
  `airportICAOCode` char(4) NOT NULL,
  `city` varchar(35) NOT NULL,
  `country` varchar(40) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `timeZone` varchar(10) NOT NULL,
  `numberOfRunways` int NOT NULL,
  `numberOfHangars` int NOT NULL,
  `numberOfParkings` int NOT NULL,
  PRIMARY KEY (`airportID`),
  UNIQUE KEY `airportIATACode` (`airportIATACode`),
  UNIQUE KEY `airportICAOCode` (`airportICAOCode`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Airport`
--

LOCK TABLES `Airport` WRITE;
/*!40000 ALTER TABLE `Airport` DISABLE KEYS */;
INSERT INTO `Airport` VALUES (7,'JFK','KJFK','New York','USA',40.6413111,-73.7781391,'-05:00',4,10,20),(8,'LAX','KLAX','Los Angeles','USA',33.9415889,-118.4085300,'-08:00',4,12,25),(9,'MAD','LEMD','Madrid','Spain',40.4983000,-3.5676000,'+01:00',3,8,15),(10,'CDG','LFPG','Paris','France',49.0097000,2.5479000,'+01:00',4,9,18),(11,'GRU','SBGR','Sao Paulo','Brazil',-23.4356000,-46.4731000,'-03:00',3,7,14);
/*!40000 ALTER TABLE `Airport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Boeing`
--

DROP TABLE IF EXISTS `Boeing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Boeing` (
  `boeingID` int NOT NULL AUTO_INCREMENT,
  `aircraftID` int DEFAULT NULL,
  `series` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`boeingID`),
  UNIQUE KEY `aircraftID` (`aircraftID`),
  CONSTRAINT `Boeing_ibfk_1` FOREIGN KEY (`aircraftID`) REFERENCES `Aircraft` (`aircraftID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Boeing`
--

LOCK TABLES `Boeing` WRITE;
/*!40000 ALTER TABLE `Boeing` DISABLE KEYS */;
/*!40000 ALTER TABLE `Boeing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CrewMember`
--

DROP TABLE IF EXISTS `CrewMember`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CrewMember` (
  `crewMemberID` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(15) NOT NULL,
  `lastName` varchar(30) NOT NULL,
  `dateOfBirth` date NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `licenseNumber` varchar(10) NOT NULL,
  `licenseExpiryDate` date NOT NULL,
  `medicalCertificateClass` enum('ClassA','ClassB','ClassC') NOT NULL,
  `medicalCertificateExpory` date NOT NULL,
  `currentRole` enum('FlightAttendant','Purser','GroundStaff') NOT NULL,
  `employmentStatus` enum('Active','Retired','Suspended') NOT NULL,
  PRIMARY KEY (`crewMemberID`),
  UNIQUE KEY `licenseNumber` (`licenseNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CrewMember`
--

LOCK TABLES `CrewMember` WRITE;
/*!40000 ALTER TABLE `CrewMember` DISABLE KEYS */;
INSERT INTO `CrewMember` VALUES (7,'Anna','Brown','1992-01-15','Female','CM1001','2027-06-10','ClassA','2026-06-10','FlightAttendant','Active'),(8,'James','Davis','1988-02-20','Male','CM1002','2028-03-20','ClassA','2026-03-20','Purser','Active'),(9,'Sophia','Miller','1993-09-10','Female','CM1003','2026-12-05','ClassB','2025-12-05','FlightAttendant','Active'),(10,'Michael','Wilson','1985-12-30','Male','CM1004','2027-01-01','ClassB','2026-01-01','GroundStaff','Active');
/*!40000 ALTER TABLE `CrewMember` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Embraer`
--

DROP TABLE IF EXISTS `Embraer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Embraer` (
  `embraerID` int NOT NULL AUTO_INCREMENT,
  `aircraftID` int DEFAULT NULL,
  `series` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`embraerID`),
  UNIQUE KEY `aircraftID` (`aircraftID`),
  CONSTRAINT `Embraer_ibfk_1` FOREIGN KEY (`aircraftID`) REFERENCES `Aircraft` (`aircraftID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Embraer`
--

LOCK TABLES `Embraer` WRITE;
/*!40000 ALTER TABLE `Embraer` DISABLE KEYS */;
/*!40000 ALTER TABLE `Embraer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Flight`
--

DROP TABLE IF EXISTS `Flight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Flight` (
  `flightID` int NOT NULL AUTO_INCREMENT,
  `flightNumber` varchar(10) NOT NULL,
  `departureAirport` varchar(4) NOT NULL,
  `arrivalAirport` varchar(4) NOT NULL,
  `scheduledDepartureTime` datetime NOT NULL,
  `scheduledArrivalTime` datetime NOT NULL,
  `aircraftID` int NOT NULL,
  `pilotCommanderID` int NOT NULL,
  `pilotFirstOfficerID` int NOT NULL,
  `flightStatus` enum('Scheduled','Boarding','Departed','InAir','Landed','Cancelled') NOT NULL,
  PRIMARY KEY (`flightID`),
  KEY `departureAirport` (`departureAirport`),
  KEY `arrivalAirport` (`arrivalAirport`),
  KEY `aircraftID` (`aircraftID`),
  KEY `pilotCommanderID` (`pilotCommanderID`),
  KEY `pilotFirstOfficerID` (`pilotFirstOfficerID`),
  CONSTRAINT `Flight_ibfk_1` FOREIGN KEY (`departureAirport`) REFERENCES `Airport` (`airportICAOCode`),
  CONSTRAINT `Flight_ibfk_2` FOREIGN KEY (`arrivalAirport`) REFERENCES `Airport` (`airportICAOCode`),
  CONSTRAINT `Flight_ibfk_3` FOREIGN KEY (`aircraftID`) REFERENCES `Aircraft` (`aircraftID`),
  CONSTRAINT `Flight_ibfk_4` FOREIGN KEY (`pilotCommanderID`) REFERENCES `Pilot` (`pilotID`),
  CONSTRAINT `Flight_ibfk_5` FOREIGN KEY (`pilotFirstOfficerID`) REFERENCES `Pilot` (`pilotID`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Flight`
--

LOCK TABLES `Flight` WRITE;
/*!40000 ALTER TABLE `Flight` DISABLE KEYS */;
/*!40000 ALTER TABLE `Flight` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FlightCrew`
--

DROP TABLE IF EXISTS `FlightCrew`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FlightCrew` (
  `flightID` int NOT NULL,
  `crewMemberID` int NOT NULL,
  PRIMARY KEY (`flightID`,`crewMemberID`),
  KEY `crewMemberID` (`crewMemberID`),
  CONSTRAINT `FlightCrew_ibfk_1` FOREIGN KEY (`flightID`) REFERENCES `Flight` (`flightID`) ON DELETE CASCADE,
  CONSTRAINT `FlightCrew_ibfk_2` FOREIGN KEY (`crewMemberID`) REFERENCES `CrewMember` (`crewMemberID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FlightCrew`
--

LOCK TABLES `FlightCrew` WRITE;
/*!40000 ALTER TABLE `FlightCrew` DISABLE KEYS */;
/*!40000 ALTER TABLE `FlightCrew` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FlightPlan`
--

DROP TABLE IF EXISTS `FlightPlan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FlightPlan` (
  `flightplanID` int NOT NULL AUTO_INCREMENT,
  `flightID` int NOT NULL,
  `departureAirport` int NOT NULL,
  `arrivalAirport` int NOT NULL,
  `alternateAirport` int NOT NULL,
  `scheduledDepartureTime` datetime NOT NULL,
  `scheduledArrivalTime` datetime NOT NULL,
  `estimatedFlightTime` decimal(5,2) NOT NULL,
  `approvedByAuthority` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`flightplanID`),
  KEY `flightID` (`flightID`),
  KEY `departureAirport` (`departureAirport`),
  KEY `arrivalAirport` (`arrivalAirport`),
  KEY `alternateAirport` (`alternateAirport`),
  CONSTRAINT `FlightPlan_ibfk_1` FOREIGN KEY (`flightID`) REFERENCES `Flight` (`flightID`),
  CONSTRAINT `FlightPlan_ibfk_2` FOREIGN KEY (`departureAirport`) REFERENCES `Airport` (`airportID`),
  CONSTRAINT `FlightPlan_ibfk_3` FOREIGN KEY (`arrivalAirport`) REFERENCES `Airport` (`airportID`),
  CONSTRAINT `FlightPlan_ibfk_4` FOREIGN KEY (`alternateAirport`) REFERENCES `Airport` (`airportID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FlightPlan`
--

LOCK TABLES `FlightPlan` WRITE;
/*!40000 ALTER TABLE `FlightPlan` DISABLE KEYS */;
/*!40000 ALTER TABLE `FlightPlan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Pilot`
--

DROP TABLE IF EXISTS `Pilot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pilot` (
  `pilotID` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(15) NOT NULL,
  `lastName` varchar(30) NOT NULL,
  `dateOfBirth` date NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `licenseNumber` varchar(10) NOT NULL,
  `licenseType` enum('SPL','PPL','CPL','ATPL') NOT NULL,
  `licenseExpiryDate` date NOT NULL,
  `medicalCertificateClass` enum('Class1','Class2','Class3') NOT NULL,
  `medicalCertificateExpory` date NOT NULL,
  `totalFlightHours` int DEFAULT '0',
  `currentRank` enum('Captain','FirstOfficer','Trainee') NOT NULL,
  `employmentStatus` enum('Active','Retired','Suspended') NOT NULL,
  PRIMARY KEY (`pilotID`),
  UNIQUE KEY `licenseNumber` (`licenseNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Pilot`
--

LOCK TABLES `Pilot` WRITE;
/*!40000 ALTER TABLE `Pilot` DISABLE KEYS */;
INSERT INTO `Pilot` VALUES (7,'John','Smith','1980-03-15','Male','LIC1001','ATPL','2027-05-30','Class1','2026-05-30',12000,'Captain','Active'),(8,'Emily','Johnson','1985-06-20','Female','LIC1002','ATPL','2028-07-15','Class1','2026-07-15',9000,'FirstOfficer','Active'),(9,'Carlos','Martinez','1990-11-10','Male','LIC1003','CPL','2026-03-12','Class2','2025-11-30',3500,'FirstOfficer','Active'),(10,'Laura','Lopez','1995-05-25','Female','LIC1004','SPL','2025-12-01','Class3','2025-10-01',500,'Trainee','Active');
/*!40000 ALTER TABLE `Pilot` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-28 20:24:31

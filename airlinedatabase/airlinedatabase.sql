-- =================================================
-- == AIRLINE MANAGEMENT SYSTEM - DATABASE SCRIPT ==
-- =================================================

-- Create the database.
CREATE DATABASE IF NOT EXISTS airlinedatabase;
USE airlinedatabase;

-- Table > Pilots.
-- ===============
CREATE TABLE pilots (
    pilot_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    license_number VARCHAR(20) UNIQUE NOT NULL DEFAULT '#####',
    license_type ENUM('ATPL', 'CPL', 'PPL') NOT NULL,
    license_expiry_date DATE NOT NULL,
    medical_certificate_class VARCHAR(10) NOT NULL,
    medical_certificate_expiry DATE NOT NULL,
    total_flight_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    current_rank ENUM('Captain', 'First Officer', 'Second Officer', 'Trainee') NOT NULL DEFAULT 'Trainee',
    employment_status ENUM('Active', 'Inactive', 'OnLeave', 'Suspended', 'Retired', 'Terminated') NOT NULL DEFAULT 'Active',
    INDEX idx_license (license_number),
    INDEX idx_status (employment_status)
);

-- Table > Cabin Crew.
-- ===================
CREATE TABLE cabincrew (
    crew_member_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    license_number VARCHAR(20) UNIQUE NOT NULL DEFAULT '#####',
    license_expiry_date DATE NOT NULL,
    medical_certificate_class VARCHAR(10) NOT NULL,
    medical_certificate_expiry DATE NOT NULL,
    current_role ENUM('Flight Assistant', 'Flight Attendant', 'Head Cabin Manager') NOT NULL,
    employment_status ENUM('Active', 'Inactive', 'OnLeave', 'Suspended', 'Retired', 'Terminated') NOT NULL DEFAULT 'Active',
    INDEX idx_license (license_number),
    INDEX idx_status (employment_status)
);

-- Table > Airports.
-- =================
CREATE TABLE airports (
    airport_id INT PRIMARY KEY AUTO_INCREMENT,
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    icao_code VARCHAR(4) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    number_of_runways INT NOT NULL DEFAULT 1,
    number_of_hangars INT NOT NULL DEFAULT 0,
    number_of_parkings INT NOT NULL DEFAULT 0,
    INDEX idx_iata (iata_code),
    INDEX idx_icao (icao_code)
);

-- Table > Aircraft.
-- =================
CREATE TABLE aircraft (
    aircraft_id INT PRIMARY KEY AUTO_INCREMENT,
    tail_number VARCHAR(20) UNIQUE NOT NULL,
    aircraft_model VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(50) NOT NULL,
    year_of_manufacture INT NOT NULL,
    seating_capacity INT NOT NULL,
    cargo_capacity DECIMAL(10,2) NOT NULL,
    status ENUM('Operational', 'Maintenance', 'ScheduledManteinance', 'AircraftOnGround', 'Inspection', 'Testing', 'OutOfService', 'Retired') NOT NULL DEFAULT 'Operational',
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    assigned_base_airport_id INT,
    FOREIGN KEY (assigned_base_airport_id) REFERENCES airports(airport_id) ON DELETE SET NULL,
    INDEX idx_tail (tail_number),
    INDEX idx_status (status)
);

-- Table > Flights.
-- ================
CREATE TABLE flights (
    flight_id INT PRIMARY KEY AUTO_INCREMENT,
    flight_number VARCHAR(10) NOT NULL,
    departure_airport_id INT NOT NULL,
    arrival_airport_id INT NOT NULL,
    scheduled_departure_time DATETIME NOT NULL,
    scheduled_arrival_time DATETIME NOT NULL,
    actual_departure_time DATETIME,
    actual_arrival_time DATETIME,
    aircraft_id INT NOT NULL,
    pilot_command_id INT NOT NULL,
    pilot_first_officer_id INT NOT NULL,
    flight_status ENUM('Scheduled', 'Boarding', 'Departed', 'InFlight', 'Landed', 'Arrived', 'Delayed', 'Canceled', 'Diverted') NOT NULL DEFAULT 'Scheduled',
    FOREIGN KEY (departure_airport_id) REFERENCES airports(airport_id),
    FOREIGN KEY (arrival_airport_id) REFERENCES airports(airport_id),
    FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id),
    FOREIGN KEY (pilot_command_id) REFERENCES pilots(pilot_id),
    FOREIGN KEY (pilot_first_officer_id) REFERENCES pilots(pilot_id),
    INDEX idx_flight_number (flight_number),
    INDEX idx_status (flight_status),
    INDEX idx_departure_time (scheduled_departure_time)
);

-- Table > Flight Crew Assignment.
-- ===============================
CREATE TABLE flight_crew_assignment (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    flight_id INT NOT NULL,
    crew_member_id INT NOT NULL,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (crew_member_id) REFERENCES cabincrew(crew_member_id),
    UNIQUE KEY unique_flight_crew (flight_id, crew_member_id)
);

-- Table > Flight Plans.
-- =====================
CREATE TABLE flight_plans (
    flight_plan_id INT PRIMARY KEY AUTO_INCREMENT,
    flight_id INT NOT NULL,
    departure_airport_id INT NOT NULL,
    arrival_airport_id INT NOT NULL,
    alternate_airport_id INT NOT NULL,
    scheduled_departure_time DATETIME NOT NULL,
    scheduled_arrival_time DATETIME NOT NULL,
    approved_by_authority BOOL NOT NULL DEFAULT FALSE,
    route_description TEXT,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (departure_airport_id) REFERENCES airports(airport_id),
    FOREIGN KEY (arrival_airport_id) REFERENCES airports(airport_id),
    FOREIGN KEY (alternate_airport_id) REFERENCES airports(airport_id)
);

-- Table > Aircraft Parking.
-- =========================
CREATE TABLE aircraft_parking (
    parking_id INT PRIMARY KEY AUTO_INCREMENT,
    airport_id INT NOT NULL,
    location_identifier VARCHAR(20) NOT NULL,
    parking_type ENUM('Gate', 'Remote', 'Hangar', 'Stand', 'MaintenanceArea') NOT NULL,
    current_occupancy_status ENUM('Available', 'Occupied', 'Reserved', 'Closed') NOT NULL DEFAULT 'Available',
    aircraft_id INT,
    FOREIGN KEY (airport_id) REFERENCES airports(airport_id) ON DELETE CASCADE,
    FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id) ON DELETE SET NULL,
    UNIQUE KEY unique_location (airport_id, location_identifier)
);

-- Table > Maintenance Hangars.
-- ============================
CREATE TABLE maintenance_hangars (
    hangar_id INT PRIMARY KEY AUTO_INCREMENT,
    airport_id INT NOT NULL,
    hangar_name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    availability_status ENUM('Available', 'Partially-Occupied', 'Occupied') NOT NULL DEFAULT 'Available',
    FOREIGN KEY (airport_id) REFERENCES airports(airport_id) ON DELETE CASCADE
);

-- Table > Maintenance Events.
-- ===========================
CREATE TABLE maintenance_events (
    maintenance_event_id INT PRIMARY KEY AUTO_INCREMENT,
    aircraft_id INT NOT NULL,
    hangar_id INT,
    maintenance_type VARCHAR(100) NOT NULL,
    start_date_time DATETIME NOT NULL,
    end_date_time DATETIME,
    maintenance_status ENUM('Scheduled', 'InProgress', 'Completed', 'Canceled', 'Deferred', 'OnHold') NOT NULL DEFAULT 'Scheduled',
    description TEXT,
    cost DECIMAL(10,2),
    FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id) ON DELETE CASCADE,
    FOREIGN KEY (hangar_id) REFERENCES maintenance_hangars(hangar_id) ON DELETE SET NULL,
    INDEX idx_status (maintenance_status),
    INDEX idx_aircraft (aircraft_id)
);

-- =========================================
--   INSERTION OF THE DATA AND INFORMATION
-- =========================================

-- AIRPORTS
INSERT INTO airports (iata_code, icao_code, city, country, latitude, longitude, timezone, number_of_runways, number_of_hangars, number_of_parkings) VALUES
('JFK', 'KJFK', 'Nueva York', 'Estados Unidos', 40.64130000, -73.77810000, 'America/New_York', 4, 8, 128),
('LAX', 'KLAX', 'Los Ángeles', 'Estados Unidos', 33.94160000, -118.40850000, 'America/Los_Angeles', 4, 6, 146),
('MAD', 'LEMD', 'Madrid', 'España', 40.49830000, -3.56760000, 'Europe/Madrid', 4, 5, 92),
('CDG', 'LFPG', 'París', 'Francia', 49.00970000, 2.54790000, 'Europe/Paris', 4, 7, 115),
('ORD', 'KORD', 'Chicago', 'Estados Unidos', 41.97420000, -87.90730000, 'America/Chicago', 7, 9, 185),
('FRA', 'EDDF', 'Frankfurt', 'Alemania', 50.03330000, 8.57056000, 'Europe/Berlin', 4, 6, 110),
('LHR', 'EGLL', 'Londres', 'Reino Unido', 51.47000000, -0.45440000, 'Europe/London', 2, 5, 95);

-- PILOTS
INSERT INTO pilots (first_name, last_name, date_of_birth, gender, license_number, license_type, license_expiry_date, medical_certificate_class, medical_certificate_expiry, total_flight_hours, current_rank, employment_status) VALUES
('John', 'Smith', '1984-07-03', 'Male', '127391', 'ATPL', '2030-12-12', 'A1', '2027-10-10', 5240.50, 'Captain', 'Active'),
('Mya', 'Miller', '2001-08-21', 'Female', '846413', 'CPL', '2030-07-10', 'A1', '2027-05-12', 2150.75, 'First Officer', 'Retired'),
('Carlos', 'Rodríguez', '1979-03-15', 'Male', '234567', 'ATPL', '2031-06-20', 'A1', '2028-03-15', 8750.25, 'Captain', 'Active'),
('Emma', 'Johnson', '1995-11-08', 'Female', '445678', 'CPL', '2029-09-30', 'A1', '2026-12-01', 1820.00, 'Second Officer', 'Active'),
('Miguel', 'Fernández', '1988-06-22', 'Male', '556789', 'ATPL', '2032-03-15', 'A1', '2029-01-20', 6500.00, 'Trainee', 'Retired');

-- CREW MEMBERS
INSERT INTO cabincrew (first_name, last_name, date_of_birth, gender, license_number, license_expiry_date, medical_certificate_class, medical_certificate_expiry, current_role, employment_status) VALUES
('Alice', 'Brown', '1999-02-14', 'Female', '96831', '2030-12-12', 'A3', '2026-01-01', 'Flight Attendant', 'Retired'),
('David', 'Kim', '1992-10-11', 'Male', '68615', '2027-12-30', 'A2', '2026-08-06', 'Flight Assistant', 'Active'),
('Sofia', 'García', '1997-05-22', 'Female', '78234', '2029-08-15', 'A3', '2027-02-10', 'Head Cabin Manager', 'Active'),
('Michael', 'Chen', '1994-09-30', 'Male', '89456', '2028-11-20', 'A2', '2026-06-15', 'Flight Assistant', 'Active'),
('Isabella', 'López', '1996-03-18', 'Female', '90567', '2029-05-25', 'A3', '2027-11-30', 'Flight Assistant', 'Active'),
('James', 'Wilson', '1993-12-05', 'Male', '12345', '2028-08-10', 'A2', '2026-09-22', 'Flight Attendant', 'Active');

-- AIRCRAFT
INSERT INTO aircraft (tail_number, aircraft_model, manufacturer, year_of_manufacture, seating_capacity, cargo_capacity, status, last_maintenance_date, next_maintenance_date, assigned_base_airport_id) VALUES
('N123AA', 'Boeing 737-800', 'Boeing', 2018, 162, 1500.00, 'Operational', '2025-10-01', '2025-12-01', 1),
('EC789IB', 'Airbus A320', 'Airbus', 2020, 180, 1200.00, 'ScheduledManteinance', '2025-09-15', '2025-11-20', 3),
('N456UA', 'Boeing 777-300ER', 'Boeing', 2019, 396, 3500.00, 'Operational', '2025-10-10', '2025-12-15', 5),
('D-AILH', 'Airbus A319', 'Airbus', 2017, 138, 900.00, 'ScheduledManteinance', '2025-11-01', '2025-11-25', 6),
('G-EUUX', 'Airbus A320neo', 'Airbus', 2021, 186, 1300.00, 'Maintenance', '2025-10-20', '2025-12-20', 7),
('N789DL', 'Boeing 737 MAX 9', 'Boeing', 2022, 178, 1400.00, 'OutOfService', '2025-10-05', '2025-12-05', 2);

-- FLIGHTS
INSERT INTO flights (flight_number, departure_airport_id, arrival_airport_id, scheduled_departure_time, scheduled_arrival_time, aircraft_id, pilot_command_id, pilot_first_officer_id, flight_status) VALUES
('AA785', 1, 2, '2025-11-16 08:00:00', '2025-11-16 11:15:00', 1, 1, 2, 'Scheduled'),
('IB7415', 3, 4, '2025-11-17 14:30:00', '2025-11-17 16:00:00', 2, 3, 4, 'Delayed'),
('UA234', 5, 2, '2025-11-16 10:30:00', '2025-11-16 13:00:00', 3, 5, 2, 'InFlight'),
('BA456', 7, 1, '2025-11-18 09:15:00', '2025-11-18 12:30:00', 5, 1, 4, 'Scheduled'),
('DL890', 2, 5, '2025-11-19 15:45:00', '2025-11-19 18:30:00', 6, 3, 2, 'Canceled');

-- CREW ASSIGNMENTS
INSERT INTO flight_crew_assignment (flight_id, crew_member_id) VALUES
(1, 1), (1, 2),
(2, 3), (2, 4), (2, 5),
(3, 1), (3, 6),
(4, 3), (4, 4),
(5, 2), (5, 5), (5, 6);

-- MAINTENANCE HANGARS
INSERT INTO maintenance_hangars (airport_id, hangar_name, capacity, availability_status) VALUES
(2, 'Midlands', 3, 'Partially-Occupied'),
(5, 'Orlandstate', 6, 'Partially-Occupied'),
(1, 'Atlantic Maintenance', 4, 'Available'),
(6, 'Frankfurt Tech', 5, 'Occupied'),
(7, 'London Service', 4, 'Available');

-- MAINTENANCE EVENTS
INSERT INTO maintenance_events (aircraft_id, hangar_id, maintenance_type, start_date_time, end_date_time, maintenance_status, description, cost) VALUES
(1, 1, 'Routine Check', '2025-08-15 08:00:00', '2025-08-20 17:00:00', 'Scheduled', 'General inspection and oil change', 15000.00),
(4, 3, 'Engine Check', '2025-11-06 09:00:00', NULL, 'InProgress', 'Complete overhaul of the right engine', 85000.00),
(3, 2, 'A-Check Inspection', '2025-10-10 07:00:00', '2025-10-12 16:00:00', 'Canceled', 'Scheduled A-Check inspection', 25000.00),
(2, 1, 'Landing Gear Repair', '2025-09-15 10:00:00', '2025-09-18 15:00:00', 'OnHold', 'Replacement of hydraulic components', 42000.00);

-- AIRCRAFT PARKING
INSERT INTO aircraft_parking (airport_id, location_identifier, parking_type, current_occupancy_status, aircraft_id) VALUES
(2, 'G12', 'Gate', 'Occupied', 1),
(5, 'S43', 'Remote', 'Available', NULL),
(1, 'B25', 'Gate', 'Reserved', 2),
(3, 'T4-32', 'Hangar', 'Occupied', NULL),
(4, 'E47', 'Stand', 'Available', NULL),
(6, 'A15', 'MaintenanceArea', 'Closed', 4),
(7, 'T5-18', 'Gate', 'Reserved', 5);

-- FLIGHT PLANS
INSERT INTO flight_plans (flight_id, departure_airport_id, arrival_airport_id, alternate_airport_id, scheduled_departure_time, scheduled_arrival_time, approved_by_authority, route_description) VALUES
(1, 1, 2, 5, '2025-11-16 08:00:00', '2025-11-16 11:15:00', true, 'Direct Route JFK-LAX waypoints HUGUENOT-DREEM-TEHACHAPI'),
(2, 3, 4, 1, '2025-11-17 14:30:00', '2025-11-17 16:00:00', true, 'Route MAD-CDG airway UN871'),
(3, 5, 2, 1, '2025-11-16 10:30:00', '2025-11-16 13:00:00', true, 'Route ORD-LAX waypoints ACITO-ROCKIES-BARSTOW');

-- ==============================================
--   IMPORTANT VIEWS FOR REPORTING AND ANALYSIS  
-- ==============================================

-- VIEW > Flight Information
CREATE VIEW flight_details AS
SELECT 
    f.flight_id,
    f.flight_number,
    f.scheduled_departure_time,
    f.scheduled_arrival_time,
    f.flight_status,
    dep.iata_code AS departure_airport,
    dep.city AS departure_city,
    arr.iata_code AS arrival_airport,
    arr.city AS arrival_city,
    a.tail_number AS aircraft,
    a.aircraft_model,
    CONCAT(pc.first_name, ' ', pc.last_name) AS pilot_in_command,
    CONCAT(pfo.first_name, ' ', pfo.last_name) AS first_officer
FROM flights f
JOIN airports dep ON f.departure_airport_id = dep.airport_id
JOIN airports arr ON f.arrival_airport_id = arr.airport_id
JOIN aircraft a ON f.aircraft_id = a.aircraft_id
JOIN pilots pc ON f.pilot_command_id = pc.pilot_id
JOIN pilots pfo ON f.pilot_first_officer_id = pfo.pilot_id;

-- VIEW > Aircraft Status
CREATE VIEW aircraft_status AS
SELECT 
    a.aircraft_id,
    a.tail_number,
    a.aircraft_model,
    a.manufacturer,
    a.status,
    a.next_maintenance_date,
    ap.iata_code AS base_airport,
    COUNT(DISTINCT f.flight_id) AS scheduled_flights
FROM aircraft a
LEFT JOIN airports ap ON a.assigned_base_airport_id = ap.airport_id
LEFT JOIN flights f ON a.aircraft_id = f.aircraft_id AND f.flight_status = 'Programado'
GROUP BY a.aircraft_id;

-- VIEW > Pilot Statistics
CREATE VIEW pilot_statistics AS
SELECT 
    p.pilot_id,
    CONCAT(p.first_name, ' ', p.last_name) AS pilot_name,
    p.current_rank,
    p.total_flight_hours,
    p.employment_status,
    COUNT(DISTINCT f.flight_id) AS total_flights_assigned
FROM pilots p
LEFT JOIN flights f ON (p.pilot_id = f.pilot_command_id OR p.pilot_id = f.pilot_first_officer_id)
GROUP BY p.pilot_id;
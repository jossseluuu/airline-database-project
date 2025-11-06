# Airline Management Database Project

## Database Description.

This project develops an Airline Management Database develops to streamline the internal operations of an airline. The system tracks critical entities, such as pilots, cabin crew members, aircraft, airports, flights, hangars, maintenance events, and flight plans. The objective is to model relationships between these entities to support efficient daily operations while keeping the database design practical, manageable and focused.

## Entities and Instances.

The database contains the following entity types, each defined with at least three descriptive attributes (in addition to a surrogate key) and illustrated with sample instances.

* **Entity Type: PILOT.**
  Attributes: 1. pilot_id 2. first_name 3. last_name 4. date_of_birth 5. gender 6. license_number 7. license_type 8. license_expiry_date 9. medical_certificate_class 10. medical_certificate_expiry 11. total_flight_hours 12. current_rank 13. employment_status 14. last_flight_id 15. next_flight_id
  Examples: • (#312, John, Smith, 7/3/1984, male, 127391, ATPL, 12/12/2030, A1, 10/10/2027, A2, captain, active, −412, −235) • (#245, Mya, Miller, 8/21/2001, female, 846413, CPL, 7/10/2030, A1, 5/12/2027, A23, first officer, retired, −847, −532)

* **Entity Type: CREW MEMBER.**
  Attributes: 1. crewmember_id 2. first_name 3. last_name 4. date_of_birth 5. gender 6. license_number 7. license_expiry_date 8. medical_certificate_class 9. medical_certificate_expiry 10. current_role 11. employment_status 12. last_flight 13. next_flight
  Examples: • (#356, Alice, Brown, 2/14/1999, female, 96831, 12/12/2030, A3, 1/1/2026, flight attendant, active, −412, −635) • (#235, David, Kim, 10/11/1992, male, 68615, 15/30/2027, A2, 8/6/2026, flight attendant, active, −755, −635)

* **Entity Type: FLIGHT.**
  Attributes: 1. flight_id 2. flight_number 3. departure_airport_code 4. arrival_airport_code 5. scheduled_departure_time 6. scheduled_arrival_time 7. aircraft_id 8. pilot_command_id 9. pilot_firstofficer_id 10. crewmembers_id 11. flight_status
  Examples: • (86987, AA785, JFK, KLAX, 08:00, 11:15, 81656, #312, #523, #235 #356 #866, landed) • (83265, IB7415, LEMD, LCDG, 14:30, 16:00, 68146, #523, #732, #934 #1012 #623 #364, scheduled)

* **Entity Type: FLIGHTPLAN.**
  Attributes: 1. flightplan_id 2. flight_id 3. departure_airport_code 4. arrival_airport_code 5. alternate_airport_code 6. scheduled_departure_time 7. scheduled_arrival_time 8. approved_by_authority
  Examples: • (0)

* **Entity Type: AIRPORT.**
  Attributes: 1. airport_id 2. airport_IATA_code 3. airport_ICAO_code 4. city 5. country 6. latitude 7. longitude 8. time_zone 9. number_of_runways 10. number_of_hangars 11. number_of_parkings
  Examples: • (0)

* **Entity Type: AIRCRAFT.**
  Attributes: 1. aircraft_id 2. aircraft_number 3. aircraft_model 4. manufacturer 5. year_of_manufacture 6. seating_capacity 7. cargo_capacity 8. status 9. last_maintenance_date 10. next_maintenance_date 11. assigned_base_airport_id 12. last_pilots_ids 13. last_crewmembers_ids
  Examples: • (0)

* **Entity Type: AIRCRAFT PARKING.**
  Attributes: 1. parking_id 2. airport_IATA_code 3. location_identifier 4. parking_type 5. current_occupancy_status 6. aircraft_id
  Examples: • (816864, KLAX, G12, Gate, Occupied, −5234) • (698313, KORD, S43, Remote Stand, Available, NULL)

* **Entity Type: MAINTENANCE EVENT.**
  Attributes: 1. maintenanceevent_id 2. aircraft_id 3. hangar_id 4. maintenance_type 5. start_date_time 6. end_date_time 7. maintenance_status
  Examples: • (98461156, 5/12/3, Routine Check, 8/15/2025, 20/15/2025, Completed) • (61838513, 6812, Engine Overhaul, 9/6/2025, NULL, In process)

* **Entity Type: MAINTENANCE HANGAR.**
  Attributes: 1. maintenancehangar_id 2. airport_IATA_code 3. hangar_name 4. capacity 5. availability_status
  Examples: • (5123, KLAX, Mindlands, 3, Busy) • (9895, KORD, Orlandstate, 6, Med-Busy)

## Use-Cases & Queries.

* Which pilot is assigned to a specific flight?
  Ex > Who is the pilot in command of flight AA101?

* Which flights are scheduled to depart from a given airport on a specific date?
  Ex > What flights are departing from JFK on September 10, 2025?

* Which aircraft are scheduled for maintenance during a given period?
  Ex > Which aircraft are scheduled for inspection between September 20 and 25, 2025?

* Which aircraft are currently occupying parking stands at a specific airport?
  Ex > Which planes are parked at Chicago Airport right now?

* What is the maintenance history of a specific aircraft?
  Ex > Show all maintenance events for the aircraft with tail number EC789X

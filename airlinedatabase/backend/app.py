"""
============================================
SISTEMA DE GESTIÓN DE AEROLÍNEA - BACKEND API COMPLETO
Servidor Flask con API REST completa + Frontend
============================================
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime, date
from decimal import Decimal
import os

# Configurar Flask para servir archivos estáticos desde la carpeta frontend
app = Flask(__name__, 
            static_folder='../frontend',
            static_url_path='')
CORS(app)

# ============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ============================================
DB_CONFIG = {
    'host': 'localhost',
    'user': 'jossseluuu',
    'password': '0705',
    'database': 'airlinedatabase',
    'port': 3306
}

# ============================================
# FUNCIONES AUXILIARES
# ============================================

def get_db_connection():
    """Crear conexión a la base de datos"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error conectando a MySQL: {e}")
        return None

def serialize_result(obj):
    """Convertir objetos no serializables a JSON"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    return obj

def format_results(cursor, data):
    """Formatear resultados de la base de datos"""
    columns = [column[0] for column in cursor.description]
    results = []
    for row in data:
        results.append(dict(zip(columns, [serialize_result(item) for item in row])))
    return results


# PRUEBA DE CONEXIÓN
print("=" * 50)
print("PROBANDO CONEXIÓN A MYSQL...")
test_conn = get_db_connection()
if test_conn:
    print("✅ CONEXIÓN EXITOSA")
    test_conn.close()
else:
    print("❌ ERROR DE CONEXIÓN")
print("=" * 50)

# ============================================
# RUTA PRINCIPAL - SERVIR FRONTEND
# ============================================

@app.route('/')
def index():
    """Servir la página principal HTML"""
    return send_from_directory(app.static_folder, 'index.html')

# ============================================
# RUTA DE API INFO
# ============================================

@app.route('/api', methods=['GET'])
def api_info():
    """Información de la API"""
    return jsonify({
        'message': 'API de Gestión de Aerolínea',
        'version': '1.0',
        'endpoints': {
            'pilots': '/api/pilots',
            'crew': '/api/crew-members',
            'flights': '/api/flights',
            'aircraft': '/api/aircraft',
            'airports': '/api/airports',
            'maintenance': '/api/maintenance',
            'hangars': '/api/hangars',
            'parkings': '/api/parkings',
            'flight_plans': '/api/flight-plans'
        }
    })

# ============================================
# ENDPOINTS - PILOTOS
# ============================================

@app.route('/api/pilots', methods=['GET'])
def get_pilots():
    """Obtener todos los pilotos"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión a la base de datos'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM pilots ORDER BY pilot_id")
        pilots = format_results(cursor, cursor.fetchall())
        cursor.close()
        connection.close()
        return jsonify(pilots)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pilots/<int:pilot_id>', methods=['GET'])
def get_pilot(pilot_id):
    """Obtener un piloto específico"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM pilots WHERE pilot_id = %s", (pilot_id,))
        result = cursor.fetchone()
        
        if result:
            columns = [column[0] for column in cursor.description]
            pilot = dict(zip(columns, [serialize_result(item) for item in result]))
            cursor.close()
            connection.close()
            return jsonify(pilot)
        
        cursor.close()
        connection.close()
        return jsonify({'error': 'Piloto no encontrado'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pilots', methods=['POST'])
def create_pilot():
    """Crear nuevo piloto"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO pilots 
            (first_name, last_name, date_of_birth, gender, license_number, 
             license_type, license_expiry_date, medical_certificate_class, 
             medical_certificate_expiry, total_flight_hours, current_rank, employment_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['first_name'], data['last_name'], data['date_of_birth'],
            data['gender'], data['license_number'], data['license_type'],
            data['license_expiry_date'], data['medical_certificate_class'],
            data['medical_certificate_expiry'], data['total_flight_hours'],
            data['current_rank'], data['employment_status']
        )
        cursor.execute(query, values)
        connection.commit()
        new_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return jsonify({'message': 'Piloto creado exitosamente', 'id': new_id}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/pilots/<int:pilot_id>', methods=['PUT'])
def update_pilot(pilot_id):
    """Actualizar piloto"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            UPDATE pilots SET
            first_name = %s, last_name = %s, date_of_birth = %s, gender = %s,
            license_number = %s, license_type = %s, license_expiry_date = %s,
            medical_certificate_class = %s, medical_certificate_expiry = %s,
            total_flight_hours = %s, current_rank = %s, employment_status = %s
            WHERE pilot_id = %s
        """
        values = (
            data['first_name'], data['last_name'], data['date_of_birth'],
            data['gender'], data['license_number'], data['license_type'],
            data['license_expiry_date'], data['medical_certificate_class'],
            data['medical_certificate_expiry'], data['total_flight_hours'],
            data['current_rank'], data['employment_status'], pilot_id
        )
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Piloto actualizado exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/pilots/<int:pilot_id>', methods=['DELETE'])
def delete_pilot(pilot_id):
    """Eliminar piloto"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM pilots WHERE pilot_id = %s", (pilot_id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Piloto eliminado exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400

# ============================================
# ENDPOINTS - TRIPULACIÓN DE CABINA
# ============================================

@app.route('/api/crew-members', methods=['GET'])
def get_crew_members():
    """Obtener toda la tripulación"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM cabincrew ORDER BY crew_member_id")
        crew = format_results(cursor, cursor.fetchall())
        cursor.close()
        connection.close()
        return jsonify(crew)
    except Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/crew-members/<int:crew_id>', methods=['GET'])
def get_crew_member(crew_id):
    """Obtener un tripulante específico"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM cabincrew WHERE crew_member_id = %s", (crew_id,))
        result = cursor.fetchone()
        
        if result:
            columns = [column[0] for column in cursor.description]
            crew = dict(zip(columns, [serialize_result(item) for item in result]))
            cursor.close()
            connection.close()
            return jsonify(crew)
        
        cursor.close()
        connection.close()
        return jsonify({'error': 'Tripulante no encontrado'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/crew-members', methods=['POST'])
def create_crew_member():
    """Crear nuevo miembro de tripulación"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO cabincrew
            (first_name, last_name, date_of_birth, gender, license_number,
             license_expiry_date, medical_certificate_class, medical_certificate_expiry,
             current_role, employment_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['first_name'], data['last_name'], data['date_of_birth'],
            data['gender'], data['license_number'], data['license_expiry_date'],
            data['medical_certificate_class'], data['medical_certificate_expiry'],
            data['current_role'], data['employment_status']
        )
        cursor.execute(query, values)
        connection.commit()
        new_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return jsonify({'message': 'Tripulante creado exitosamente', 'id': new_id}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/crew-members/<int:crew_id>', methods=['PUT'])
def update_crew_member(crew_id):
    """Actualizar tripulante"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            UPDATE cabincrew SET
            first_name = %s, last_name = %s, date_of_birth = %s, gender = %s,
            license_number = %s, license_expiry_date = %s,
            medical_certificate_class = %s, medical_certificate_expiry = %s,
            current_role = %s, employment_status = %s
            WHERE crew_member_id = %s
        """
        values = (
            data['first_name'], data['last_name'], data['date_of_birth'],
            data['gender'], data['license_number'], data['license_expiry_date'],
            data['medical_certificate_class'], data['medical_certificate_expiry'],
            data['current_role'], data['employment_status'], crew_id
        )
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Tripulante actualizado exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/crew-members/<int:crew_id>', methods=['DELETE'])
def delete_crew_member(crew_id):
    """Eliminar tripulante"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM cabincrew WHERE crew_member_id = %s", (crew_id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Tripulante eliminado exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400
        
# ============================================
# ENDPOINTS - VUELOS
# ============================================

@app.route('/api/flights', methods=['GET'])
def get_flights():
    """Obtener todos los vuelos con información completa"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            SELECT 
                f.flight_id,
                f.flight_number,
                f.scheduled_departure_time,
                f.scheduled_arrival_time,
                f.flight_status,
                dep.iata_code AS departure_airport,
                arr.iata_code AS arrival_airport,
                a.tail_number AS aircraft,
                f.aircraft_id,
                f.departure_airport_id,
                f.arrival_airport_id,
                f.pilot_command_id,
                f.pilot_first_officer_id
            FROM flights f
            LEFT JOIN airports dep ON f.departure_airport_id = dep.airport_id
            LEFT JOIN airports arr ON f.arrival_airport_id = arr.airport_id
            LEFT JOIN aircraft a ON f.aircraft_id = a.aircraft_id
            ORDER BY f.scheduled_departure_time DESC
        """
        cursor.execute(query)
        flights = format_results(cursor, cursor.fetchall())
        cursor.close()
        connection.close()
        return jsonify(flights)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/flights/<int:flight_id>', methods=['GET'])
def get_flight(flight_id):
    """Obtener un vuelo específico"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM flights WHERE flight_id = %s", (flight_id,))
        result = cursor.fetchone()
        
        if result:
            columns = [column[0] for column in cursor.description]
            flight = dict(zip(columns, [serialize_result(item) for item in result]))
            cursor.close()
            connection.close()
            return jsonify(flight)
        
        cursor.close()
        connection.close()
        return jsonify({'error': 'Vuelo no encontrado'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/flights', methods=['POST'])
def create_flight():
    """Crear nuevo vuelo"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO flights 
            (flight_number, departure_airport_id, arrival_airport_id,
             scheduled_departure_time, scheduled_arrival_time, aircraft_id,
             pilot_command_id, pilot_first_officer_id, flight_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['flight_number'], 
            data['departure_airport_id'], 
            data['arrival_airport_id'],
            data['scheduled_departure_time'], 
            data['scheduled_arrival_time'],
            data['aircraft_id'], 
            data['pilot_command_id'], 
            data['pilot_first_officer_id'],
            data.get('flight_status', 'Scheduled')
        )
        cursor.execute(query, values)
        connection.commit()
        
        new_flight_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return jsonify({'message': 'Vuelo creado exitosamente', 'id': new_flight_id}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/flights/<int:flight_id>', methods=['PUT'])
def update_flight(flight_id):
    """Actualizar vuelo"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            UPDATE flights SET
            flight_number = %s, departure_airport_id = %s, arrival_airport_id = %s,
            scheduled_departure_time = %s, scheduled_arrival_time = %s,
            aircraft_id = %s, pilot_command_id = %s, pilot_first_officer_id = %s,
            flight_status = %s
            WHERE flight_id = %s
        """
        values = (
            data['flight_number'], 
            data['departure_airport_id'], 
            data['arrival_airport_id'],
            data['scheduled_departure_time'], 
            data['scheduled_arrival_time'],
            data['aircraft_id'], 
            data['pilot_command_id'], 
            data['pilot_first_officer_id'],
            data['flight_status'], 
            flight_id
        )
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Vuelo actualizado exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/flights/<int:flight_id>', methods=['DELETE'])
def delete_flight(flight_id):
    """Eliminar vuelo"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM flights WHERE flight_id = %s", (flight_id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Vuelo eliminado exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400

# ============================================
# ENDPOINTS - AERONAVES
# ============================================

@app.route('/api/aircraft', methods=['GET'])
def get_aircraft():
    """Obtener todas las aeronaves"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM aircraft ORDER BY aircraft_id")
        aircraft_list = format_results(cursor, cursor.fetchall())
        cursor.close()
        connection.close()
        return jsonify(aircraft_list)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/aircraft/<int:aircraft_id>', methods=['GET'])
def get_single_aircraft(aircraft_id):
    """Obtener una aeronave específica"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM aircraft WHERE aircraft_id = %s", (aircraft_id,))
        result = cursor.fetchone()
        
        if result:
            columns = [column[0] for column in cursor.description]
            aircraft = dict(zip(columns, [serialize_result(item) for item in result]))
            cursor.close()
            connection.close()
            return jsonify(aircraft)
        
        cursor.close()
        connection.close()
        return jsonify({'error': 'Aeronave no encontrada'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/aircraft', methods=['POST'])
def create_aircraft():
    """Crear nueva aeronave"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO aircraft 
            (tail_number, aircraft_model, manufacturer, year_of_manufacture,
             seating_capacity, cargo_capacity, status, last_maintenance_date,
             next_maintenance_date, assigned_base_airport_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['tail_number'], 
            data['aircraft_model'], 
            data['manufacturer'],
            data['year_of_manufacture'], 
            data['seating_capacity'], 
            data['cargo_capacity'],
            data['status'], 
            data.get('last_maintenance_date'), 
            data.get('next_maintenance_date'),
            data.get('assigned_base_airport_id')
        )
        cursor.execute(query, values)
        connection.commit()
        new_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return jsonify({'message': 'Aeronave creada exitosamente', 'id': new_id}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/aircraft/<int:aircraft_id>', methods=['PUT'])
def update_aircraft(aircraft_id):
    """Actualizar aeronave"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            UPDATE aircraft SET
            tail_number = %s, aircraft_model = %s, manufacturer = %s,
            year_of_manufacture = %s, seating_capacity = %s, cargo_capacity = %s,
            status = %s, last_maintenance_date = %s, next_maintenance_date = %s,
            assigned_base_airport_id = %s
            WHERE aircraft_id = %s
        """
        values = (
            data['tail_number'], 
            data['aircraft_model'], 
            data['manufacturer'],
            data['year_of_manufacture'], 
            data['seating_capacity'], 
            data['cargo_capacity'],
            data['status'], 
            data.get('last_maintenance_date'), 
            data.get('next_maintenance_date'),
            data.get('assigned_base_airport_id'), 
            aircraft_id
        )
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Aeronave actualizada exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/aircraft/<int:aircraft_id>', methods=['DELETE'])
def delete_aircraft(aircraft_id):
    """Eliminar aeronave"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM aircraft WHERE aircraft_id = %s", (aircraft_id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Aeronave eliminada exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400

# ============================================
# ENDPOINTS - AEROPUERTOS
# ============================================

@app.route('/api/airports', methods=['GET'])
def get_airports():
    """Obtener todos los aeropuertos"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM airports ORDER BY airport_id")
        airports = format_results(cursor, cursor.fetchall())
        cursor.close()
        connection.close()
        return jsonify(airports)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/airports/<int:airport_id>', methods=['GET'])
def get_airport(airport_id):
    """Obtener un aeropuerto específico"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM airports WHERE airport_id = %s", (airport_id,))
        result = cursor.fetchone()
        
        if result:
            columns = [column[0] for column in cursor.description]
            airport = dict(zip(columns, [serialize_result(item) for item in result]))
            cursor.close()
            connection.close()
            return jsonify(airport)
        
        cursor.close()
        connection.close()
        return jsonify({'error': 'Aeropuerto no encontrado'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/airports', methods=['POST'])
def create_airport():
    """Crear nuevo aeropuerto"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO airports 
            (iata_code, icao_code, city, country, latitude, longitude,
             timezone, number_of_runways, number_of_hangars, number_of_parkings)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['iata_code'], 
            data['icao_code'], 
            data['city'], 
            data['country'],
            data['latitude'], 
            data['longitude'], 
            data['timezone'],
            data['number_of_runways'], 
            data['number_of_hangars'], 
            data['number_of_parkings']
        )
        cursor.execute(query, values)
        connection.commit()
        new_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return jsonify({'message': 'Aeropuerto creado exitosamente', 'id': new_id}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/airports/<int:airport_id>', methods=['PUT'])
def update_airport(airport_id):
    """Actualizar aeropuerto"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            UPDATE airports SET
            iata_code = %s, icao_code = %s, city = %s, country = %s,
            latitude = %s, longitude = %s, timezone = %s,
            number_of_runways = %s, number_of_hangars = %s, number_of_parkings = %s
            WHERE airport_id = %s
        """
        values = (
            data['iata_code'], 
            data['icao_code'], 
            data['city'], 
            data['country'],
            data['latitude'], 
            data['longitude'], 
            data['timezone'],
            data['number_of_runways'], 
            data['number_of_hangars'], 
            data['number_of_parkings'],
            airport_id
        )
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Aeropuerto actualizado exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/airports/<int:airport_id>', methods=['DELETE'])
def delete_airport(airport_id):
    """Eliminar aeropuerto"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM airports WHERE airport_id = %s", (airport_id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Aeropuerto eliminado exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400

# ============================================
# ENDPOINTS - MANTENIMIENTO
# ============================================

@app.route('/api/maintenance', methods=['GET'])
def get_maintenance():
    """Obtener eventos de mantenimiento"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM maintenance_events ORDER BY start_date_time DESC")
        events = format_results(cursor, cursor.fetchall())
        cursor.close()
        connection.close()
        return jsonify(events)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/maintenance/<int:maintenance_id>', methods=['GET'])
def get_maintenance_event(maintenance_id):
    """Obtener un evento de mantenimiento específico"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM maintenance_events WHERE maintenance_event_id = %s", (maintenance_id,))
        result = cursor.fetchone()
        
        if result:
            columns = [column[0] for column in cursor.description]
            event = dict(zip(columns, [serialize_result(item) for item in result]))
            cursor.close()
            connection.close()
            return jsonify(event)
        
        cursor.close()
        connection.close()
        return jsonify({'error': 'Evento no encontrado'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/maintenance', methods=['POST'])
def create_maintenance():
    """Crear nuevo evento de mantenimiento"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO maintenance_events 
            (aircraft_id, hangar_id, maintenance_type, start_date_time,
             end_date_time, maintenance_status, description, cost)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['aircraft_id'], 
            data.get('hangar_id'), 
            data['maintenance_type'],
            data['start_date_time'], 
            data.get('end_date_time'),
            data.get('maintenance_status', 'Scheduled'),
            data.get('description'),
            data.get('cost')
        )
        cursor.execute(query, values)
        connection.commit()
        new_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return jsonify({'message': 'Evento de mantenimiento creado exitosamente', 'id': new_id}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/maintenance/<int:maintenance_id>', methods=['PUT'])
def update_maintenance(maintenance_id):
    """Actualizar evento de mantenimiento"""
    data = request.get_json()
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            UPDATE maintenance_events SET
            aircraft_id = %s, hangar_id = %s, maintenance_type = %s,
            start_date_time = %s, end_date_time = %s, maintenance_status = %s,
            description = %s, cost = %s
            WHERE maintenance_event_id = %s
        """
        values = (
            data['aircraft_id'], 
            data.get('hangar_id'), 
            data['maintenance_type'],
            data['start_date_time'], 
            data.get('end_date_time'),
            data['maintenance_status'],
            data.get('description'),
            data.get('cost'),
            maintenance_id
        )
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Evento actualizado exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/maintenance/<int:maintenance_id>', methods=['DELETE'])
def delete_maintenance(maintenance_id):
    """Eliminar evento de mantenimiento"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM maintenance_events WHERE maintenance_event_id = %s", (maintenance_id,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Evento eliminado exitosamente'})
    except Error as e:
        return jsonify({'error': str(e)}), 400

# ============================================
# ENDPOINTS - HANGARES
# ============================================

@app.route('/api/hangars', methods=['GET'])
def get_hangars():
    """Obtener todos los hangares"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Error de conexión'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM maintenance_hangars ORDER BY hangar_id")
        hangars = format_results(cursor, cursor.fetchall())
        cursor.close()
        connection.close()
        return jsonify(hangars)
    except Error as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("Servidor iniciado correctamente")
    print("Accede a: http://localhost:5000")
    print("API disponible en: http://localhost:5000/api")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, render_template_string, request, redirect, url_for
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# Database configuration - CAMBIA ESTOS VALORES
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'tu_password',
    'database': 'airline_project'
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        print("✅ Conexión exitosa a la base de datos")
        return connection
    except Error as e:
        print(f"❌ Error conectando a MySQL: {e}")
        return None

MAIN_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Airline Database - Pilots</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        h1 { color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; background: white; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #3498db; color: white; }
        tr:hover { background: #f5f5f5; }
        .info-box { background: #e8f4f8; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
        .message { padding: 15px; margin: 10px 0; border-radius: 4px; font-weight: bold; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .btn { display: inline-block; padding: 12px 24px; background: #27ae60; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .btn:hover { background: #229954; }
    </style>
</head>
<body>
    <h1>✈️ Airline Database - 🧑‍✈️ Pilot Information</h1>
    
    {% if message %}
    <div class="message {{ message_type }}">{{ message }}</div>
    {% endif %}
    
    <div class="info-box">
        <p><strong>Database:</strong> Airline Project</p>
        <p><strong>Table:</strong> Pilot</p>
    </div>
    
    <a href="{{ url_for('add_pilot_form') }}" class="btn">➕ Add New Pilot</a>
    
    <h2>🌟 Pilot Records ({{ pilot_count }} total)</h2>
    
    {% if pilot_count == 0 %}
    <div class="info-box">
        <p>No pilots found. Click "Add New Pilot" to add the first pilot.</p>
    </div>
    {% else %}
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Gender</th>
                <th>License</th>
                <th>Rank</th>
                <th>Hours</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            {% for pilot in pilots %}
            <tr>
                <td>{{ pilot[0] }}</td>
                <td>{{ pilot[1] }}</td>
                <td>{{ pilot[2] }}</td>
                <td>{{ pilot[3] }}</td>
                <td>{{ pilot[4] }}</td>
                <td>{{ pilot[5] }}</td>
                <td>{{ pilot[6] }}</td>
                <td>{{ pilot[7] }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
    {% endif %}
    
    <div class="info-box">
        <h3>Legend</h3>
        <p><strong>Licenses:</strong> SPL=Student, PPL=Private, CPL=Commercial, ATPL=Airline Transport</p>
        <p><strong>Ranks:</strong> Trainee, First Officer, Captain</p>
        <p><strong>Status:</strong> Active, Unactive, Retired</p>
    </div>
</body>
</html>
"""

ADD_FORM = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Add New Pilot</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        h1 { color: #2c3e50; text-align: center; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; color: #34495e; }
        input, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        input[type="submit"] { background: #27ae60; color: white; border: none; cursor: pointer; font-weight: bold; }
        input[type="submit"]:hover { background: #229954; }
        .back { display: block; text-align: center; margin-top: 20px; color: #3498db; }
    </style>
</head>
<body>
    <div class="container">
        <h1>➕ Add New Pilot</h1>
        <form method="POST" action="{{ url_for('index') }}">
            <div class="form-group">
                <label>First Name: *</label>
                <input type="text" name="first_name" required placeholder="Enter first name">
            </div>
            
            <div class="form-group">
                <label>Last Name: *</label>
                <input type="text" name="last_name" required placeholder="Enter last name">
            </div>
            
            <div class="form-group">
                <label>Gender: *</label>
                <select name="gender" required>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>License Type: *</label>
                <select name="license_type" required>
                    <option value="">Select...</option>
                    <option value="SPL">SPL - Student Pilot</option>
                    <option value="PPL">PPL - Private Pilot</option>
                    <option value="CPL">CPL - Commercial Pilot</option>
                    <option value="ATPL">ATPL - Airline Transport</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Current Rank: *</label>
                <select name="current_rank" required>
                    <option value="">Select...</option>
                    <option value="Trainee">Trainee</option>
                    <option value="First Officer">First Officer</option>
                    <option value="Captain">Captain</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Flight Hours: *</label>
                <input type="number" name="flight_hours" min="0" required placeholder="Enter hours">
            </div>
            
            <div class="form-group">
                <label>Status: *</label>
                <select name="status" required>
                    <option value="">Select...</option>
                    <option value="Active">Active</option>
                    <option value="Unactive">Unactive</option>
                    <option value="Retired">Retired</option>
                </select>
            </div>
            
            <input type="submit" value="✈️ Add Pilot">
        </form>
        
        <a href="{{ url_for('index') }}" class="back">← Back to Pilot List</a>
    </div>
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def index():
    message = None
    message_type = None
    
    if request.method == 'POST':
        print("\n" + "="*50)
        print("📝 FORMULARIO RECIBIDO")
        print("="*50)
        
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        gender = request.form.get('gender')
        license_type = request.form.get('license_type')
        current_rank = request.form.get('current_rank')
        flight_hours = request.form.get('flight_hours')
        status = request.form.get('status')
        
        print(f"First Name: {first_name}")
        print(f"Last Name: {last_name}")
        print(f"Gender: {gender}")
        print(f"License: {license_type}")
        print(f"Rank: {current_rank}")
        print(f"Hours: {flight_hours}")
        print(f"Status: {status}")
        
        if not all([first_name, last_name, gender, license_type, current_rank, flight_hours, status]):
            message = "❌ All fields required!"
            message_type = "error"
            print("❌ Campos vacíos")
        else:
            connection = get_db_connection()
            if connection:
                try:
                    cursor = connection.cursor()
                    
                    query = """
                        INSERT INTO Pilot (first_name, last_name, gender, license_type, 
                                          current_rank, flight_hours, status)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    print(f"\n🔄 Ejecutando INSERT...")
                    
                    cursor.execute(query, (first_name, last_name, gender, 
                                          license_type, current_rank, 
                                          int(flight_hours), status))
                    connection.commit()
                    
                    print(f"✅ INSERT exitoso! ID: {cursor.lastrowid}")
                    
                    message = f"✅ Pilot added: {first_name} {last_name} (ID: {cursor.lastrowid})"
                    message_type = "success"
                    cursor.close()
                except Error as e:
                    print(f"❌ ERROR: {e}")
                    message = f"❌ Error: {e}"
                    message_type = "error"
                    connection.rollback()
                finally:
                    connection.close()
            else:
                message = "❌ Database connection failed"
                message_type = "error"
        
        print("="*50 + "\n")
    
    pilots = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            print("🔍 Consultando pilotos...")
            cursor.execute("SELECT * FROM Pilot ORDER BY pilot_id")
            pilots = cursor.fetchall()
            print(f"✅ Encontrados: {len(pilots)} pilotos")
            for p in pilots:
                print(f"   - {p}")
            cursor.close()
        except Error as e:
            print(f"❌ Error SELECT: {e}")
            message = f"❌ Error: {e}"
            message_type = "error"
        finally:
            connection.close()
    
    return render_template_string(MAIN_PAGE, 
                                 pilots=pilots, 
                                 pilot_count=len(pilots),
                                 message=message,
                                 message_type=message_type)

@app.route('/add')
def add_pilot_form():
    return render_template_string(ADD_FORM)

@app.route('/test')
def test_connection():
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            cursor.execute("DESCRIBE Pilot")
            columns = cursor.fetchall()
            cursor.close()
            connection.close()
            return f"<h2>✅ Connected!</h2><p>Tables: {tables}</p><p>Pilot columns: {columns}</p>"
        except Error as e:
            return f"<h2>❌ Error:</h2><p>{e}</p>"
    return "<h2>❌ Cannot connect</h2>"

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 SERVIDOR FLASK INICIADO")
    print("="*50)
    print("URL: http://localhost:5000")
    print("Test: http://localhost:5000/test")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
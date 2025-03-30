from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from taxi_report import TaxiReport
import logging
import os
from datetime import datetime

app = Flask(__name__)
# Configurar CORS para permitir todas las rutas y métodos
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5002", "http://127.0.0.1:5002"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configurar logging
if not os.path.exists('logs'):
    os.makedirs('logs')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename=f'logs/app_{datetime.now().strftime("%Y%m%d")}.log'
)
logger = logging.getLogger('FlotaTaxi')

# Diccionario para mantener las instancias de reportes
reports = {}

@app.route('/')
def index():
    return send_from_directory('FLOTATAXI/src', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('FLOTATAXI/src', path)

@app.route('/api/init-colsa', methods=['POST', 'OPTIONS'])
def init_colsa():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'message': 'Usuario y contraseña son requeridos'
            })

        # Crear o recuperar instancia de reporte
        report = reports.get(username)
        if not report:
            report = TaxiReport()
            reports[username] = report

        # Inicializar GPS
        result = report.initialize_gps(username, password)
        logger.info(f"Resultado de inicialización GPS para {username}: {result}")
        
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error en init_colsa: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error al inicializar GPS: {str(e)}'
        })

@app.route('/api/get-vehicle-data', methods=['GET', 'OPTIONS'])
def get_vehicle_data():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        username = request.args.get('username')
        vehicle_id = request.args.get('vehicle_id')
        
        if not username or not vehicle_id:
            return jsonify({
                'success': False,
                'message': 'Usuario y ID de vehículo son requeridos'
            })

        report = reports.get(username)
        if not report:
            return jsonify({
                'success': False,
                'message': 'Cliente no inicializado'
            })

        result = report.get_taxi_location(vehicle_id)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error al obtener datos del vehículo: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        })

@app.route('/api/start-tracking', methods=['POST', 'OPTIONS'])
def start_tracking():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        username = data.get('username')
        taxi_ids = data.get('taxi_ids', [])
        interval = data.get('interval', 30)
        
        if not username:
            return jsonify({
                'success': False,
                'message': 'Usuario es requerido'
            })

        report = reports.get(username)
        if not report:
            return jsonify({
                'success': False,
                'message': 'Cliente no inicializado'
            })

        result = report.start_tracking(taxi_ids, interval)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error al iniciar seguimiento: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        })

@app.route('/api/stop-tracking', methods=['POST', 'OPTIONS'])
def stop_tracking():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        username = request.json.get('username')
        
        if not username:
            return jsonify({
                'success': False,
                'message': 'Usuario es requerido'
            })

        report = reports.get(username)
        if report:
            result = report.stop_tracking()
            return jsonify(result)
        else:
            return jsonify({
                'success': False,
                'message': 'Cliente no encontrado'
            })

    except Exception as e:
        logger.error(f"Error al detener seguimiento: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        })

if __name__ == '__main__':
    app.run(debug=True, port=5002, host='0.0.0.0') 
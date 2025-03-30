import requests
import json
from datetime import datetime
import time
import threading
import logging

class ColsaIntegration:
    def __init__(self):
        self.base_url = "https://www.colsa.com.ar/api"
        self.api_key = "COLSA_API_KEY_2024_TAXI_FLOTA"
        self.session = requests.Session()
        self.token = None
        self.tracking_thread = None
        self.stop_tracking = False
        self.vehicles = {}
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger('ColsaIntegration')

    def login(self, username, password):
        """Autenticar con el servicio de Colsa"""
        try:
            # Simular login exitoso
            self.token = f"mock_token_{int(time.time())}"
            self.logger.info(f"Login exitoso para usuario: {username}")
            return {
                "success": True,
                "token": self.token,
                "message": "Login exitoso"
            }
        except Exception as e:
            self.logger.error(f"Error en login: {str(e)}")
            return {
                "success": False,
                "message": f"Error de autenticación: {str(e)}"
            }

    def start_tracking(self, update_interval=30):
        """Iniciar el seguimiento GPS"""
        if self.tracking_thread and self.tracking_thread.is_alive():
            return

        self.stop_tracking = False
        self.tracking_thread = threading.Thread(target=self._tracking_loop, args=(update_interval,))
        self.tracking_thread.daemon = True
        self.tracking_thread.start()
        self.logger.info("Seguimiento GPS iniciado")

    def stop_tracking(self):
        """Detener el seguimiento GPS"""
        self.stop_tracking = True
        if self.tracking_thread:
            self.tracking_thread.join()
        self.logger.info("Seguimiento GPS detenido")

    def _tracking_loop(self, interval):
        """Loop principal para el seguimiento GPS"""
        while not self.stop_tracking:
            try:
                self._update_vehicle_positions()
                time.sleep(interval)
            except Exception as e:
                self.logger.error(f"Error en tracking loop: {str(e)}")
                time.sleep(5)  # Esperar antes de reintentar

    def _update_vehicle_positions(self):
        """Actualizar las posiciones de los vehículos"""
        try:
            # Simular actualización de posiciones
            for vehicle_id in self.vehicles:
                self.vehicles[vehicle_id].update({
                    'timestamp': datetime.now().isoformat(),
                    'latitude': -34.6037 + (hash(vehicle_id) % 100) / 10000,
                    'longitude': -58.3816 + (hash(vehicle_id) % 100) / 10000,
                    'speed': (hash(vehicle_id) % 60),
                    'status': 'active'
                })
            self.logger.info("Posiciones de vehículos actualizadas")
        except Exception as e:
            self.logger.error(f"Error actualizando posiciones: {str(e)}")

    def get_vehicle_position(self, vehicle_id):
        """Obtener la posición actual de un vehículo"""
        return self.vehicles.get(vehicle_id, {})

    def add_vehicle(self, vehicle_id, initial_data=None):
        """Agregar un vehículo al seguimiento"""
        self.vehicles[vehicle_id] = initial_data or {}
        self.logger.info(f"Vehículo agregado: {vehicle_id}")

    def remove_vehicle(self, vehicle_id):
        """Eliminar un vehículo del seguimiento"""
        if vehicle_id in self.vehicles:
            del self.vehicles[vehicle_id]
            self.logger.info(f"Vehículo eliminado: {vehicle_id}")

    def get_all_vehicles(self):
        """Obtener datos de todos los vehículos"""
        return self.vehicles

    def is_tracking_active(self):
        """Verificar si el seguimiento está activo"""
        return self.tracking_thread is not None and self.tracking_thread.is_alive() 
import json
import logging
from datetime import datetime
from colsa_api_client import ColsaApiClient

class TaxiReport:
    def __init__(self):
        # Configurar logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            filename='taxi_report.log'
        )
        self.logger = logging.getLogger('TaxiReport')
        self.colsa_client = None

    def initialize_gps(self, username, password):
        """Inicializar cliente GPS de Colsa"""
        try:
            self.colsa_client = ColsaApiClient()
            result = self.colsa_client.connect(username, password)
            
            if result['success']:
                self.logger.info(f"GPS inicializado para usuario: {username}")
                return {
                    'success': True,
                    'message': 'GPS inicializado correctamente'
                }
            else:
                self.logger.error(f"Error al inicializar GPS: {result['message']}")
                return {
                    'success': False,
                    'message': result['message']
                }
        except Exception as e:
            self.logger.error(f"Error en initialize_gps: {str(e)}")
            return {
                'success': False,
                'message': f'Error al inicializar GPS: {str(e)}'
            }

    def get_taxi_location(self, taxi_id):
        """Obtener ubicación actual del taxi"""
        try:
            if not self.colsa_client or not self.colsa_client.is_connected:
                return {
                    'success': False,
                    'message': 'Cliente GPS no inicializado'
                }

            data = self.colsa_client.get_vehicle_data(taxi_id)
            return {
                'success': True,
                'data': {
                    'taxi_id': taxi_id,
                    'latitude': data['latitude'],
                    'longitude': data['longitude'],
                    'speed': data['speed'],
                    'timestamp': data['timestamp']
                }
            }
        except Exception as e:
            self.logger.error(f"Error al obtener ubicación del taxi {taxi_id}: {str(e)}")
            return {
                'success': False,
                'message': f'Error al obtener ubicación: {str(e)}'
            }

    def start_tracking(self, taxi_ids, interval=30):
        """Iniciar seguimiento de taxis"""
        try:
            if not self.colsa_client or not self.colsa_client.is_connected:
                return {
                    'success': False,
                    'message': 'Cliente GPS no inicializado'
                }

            result = self.colsa_client.start_tracking(interval)
            if result:
                self.logger.info(f"Seguimiento iniciado para taxis: {taxi_ids}")
                return {
                    'success': True,
                    'message': 'Seguimiento iniciado correctamente'
                }
            else:
                return {
                    'success': False,
                    'message': 'Error al iniciar seguimiento'
                }
        except Exception as e:
            self.logger.error(f"Error al iniciar seguimiento: {str(e)}")
            return {
                'success': False,
                'message': f'Error al iniciar seguimiento: {str(e)}'
            }

    def stop_tracking(self):
        """Detener seguimiento de taxis"""
        try:
            if self.colsa_client:
                self.colsa_client.stop_tracking()
                self.logger.info("Seguimiento detenido")
                return {
                    'success': True,
                    'message': 'Seguimiento detenido correctamente'
                }
            return {
                'success': False,
                'message': 'Cliente GPS no inicializado'
            }
        except Exception as e:
            self.logger.error(f"Error al detener seguimiento: {str(e)}")
            return {
                'success': False,
                'message': f'Error al detener seguimiento: {str(e)}'
            }

    def generate_report(self, taxi_id, start_date=None, end_date=None):
        """Generar reporte de actividad del taxi"""
        try:
            if not self.colsa_client or not self.colsa_client.is_connected:
                return {
                    'success': False,
                    'message': 'Cliente GPS no inicializado'
                }

            # Si no se especifican fechas, usar el día actual
            if not start_date:
                start_date = datetime.now().replace(hour=0, minute=0, second=0)
            if not end_date:
                end_date = datetime.now()

            # Obtener datos actuales del taxi
            current_data = self.colsa_client.get_vehicle_data(taxi_id)
            
            # Crear reporte
            report = {
                'taxi_id': taxi_id,
                'fecha_reporte': datetime.now().isoformat(),
                'periodo': {
                    'inicio': start_date.isoformat(),
                    'fin': end_date.isoformat()
                },
                'ultima_ubicacion': {
                    'latitude': current_data['latitude'],
                    'longitude': current_data['longitude'],
                    'speed': current_data['speed'],
                    'timestamp': current_data['timestamp']
                },
                'estado': current_data['status']
            }

            # Guardar reporte
            filename = f"report_taxi_{taxi_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w') as f:
                json.dump(report, f, indent=4)

            self.logger.info(f"Reporte generado para taxi {taxi_id}: {filename}")
            return {
                'success': True,
                'message': f'Reporte generado: {filename}',
                'data': report
            }
        except Exception as e:
            self.logger.error(f"Error al generar reporte para taxi {taxi_id}: {str(e)}")
            return {
                'success': False,
                'message': f'Error al generar reporte: {str(e)}'
            }

# Ejemplo de uso
if __name__ == "__main__":
    # Crear instancia del reporte
    report_manager = TaxiReport()
    
    # Inicializar GPS con credenciales
    result = report_manager.initialize_gps("usuario_demo", "password_demo")
    if result['success']:
        try:
            # Iniciar seguimiento de algunos taxis
            taxi_ids = ["TX-1001", "TX-1002", "TX-1003"]
            tracking_result = report_manager.start_tracking(taxi_ids)
            
            if tracking_result['success']:
                # Generar reporte para un taxi específico
                report_result = report_manager.generate_report("TX-1001")
                if report_result['success']:
                    print(f"Reporte generado exitosamente: {report_result['data']}")
                else:
                    print(f"Error al generar reporte: {report_result['message']}")
        except Exception as e:
            print(f"Error durante la ejecución: {str(e)}")
        finally:
            # Detener seguimiento
            report_manager.stop_tracking()
    else:
        print(f"Error al inicializar GPS: {result['message']}") 
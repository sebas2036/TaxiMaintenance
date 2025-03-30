import os
import json
import logging
from colsa_api_client import ColsaApiClient
import time
from datetime import datetime

def load_config():
    """Cargar configuración desde archivo"""
    config_path = 'config.json'
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return json.load(f)
    return None

def save_config(config):
    """Guardar configuración en archivo"""
    with open('config.json', 'w') as f:
        json.dump(config, f, indent=4)

def setup_logging():
    """Configurar logging"""
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    log_file = os.path.join(log_dir, f'colsa_client_{datetime.now().strftime("%Y%m%d")}.log')
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger('ColsaClient')

def main():
    # Configurar logging
    logger = setup_logging()
    logger.info("Iniciando cliente Colsa")

    # Cargar configuración
    config = load_config()
    if not config:
        logger.info("No se encontró archivo de configuración. Creando uno nuevo...")
        config = {
            'api_url': 'https://www.colsa.com.ar/api',
            'username': input('Usuario: '),
            'password': input('Contraseña: '),
            'vehicles': input('IDs de vehículos (separados por coma): ').split(','),
            'update_interval': int(input('Intervalo de actualización (segundos): '))
        }
        save_config(config)

    # Crear y configurar cliente
    client = ColsaApiClient(base_url=config['api_url'])
    
    # Intentar conexión
    if not client.connect(config['username'], config['password']):
        logger.error("No se pudo conectar con Colsa. Verificar credenciales.")
        return

    # Iniciar actualizaciones automáticas
    logger.info(f"Iniciando seguimiento para vehículos: {', '.join(config['vehicles'])}")
    update_thread = client.start_automatic_updates(
        config['vehicles'],
        interval=config['update_interval']
    )

    try:
        # Mantener el script corriendo y mostrar estado
        while True:
            logger.info("Cliente ejecutándose... Presione Ctrl+C para detener")
            time.sleep(60)  # Mostrar estado cada minuto
            
    except KeyboardInterrupt:
        logger.info("Deteniendo cliente...")
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
    finally:
        logger.info("Cliente detenido")

if __name__ == "__main__":
    main() 
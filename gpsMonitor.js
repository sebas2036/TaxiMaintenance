const { openColsaGPSView, extractGPSData } = require('./logincolsa');

async function monitorGPS() {
    try {
        // Abrir la vista GPS
        const page = await openColsaGPSView();
        
        // Configurar intervalo de monitoreo (cada 5 minutos)
        setInterval(async () => {
            try {
                // Extraer datos de los vehículos
                const vehicles = await extractGPSData(page);
                
                // Procesar los datos
                console.log('Vehículos actualizados:', new Date().toISOString());
                console.log(vehicles);
                
                // Aquí puedes agregar tu lógica personalizada
                // Por ejemplo:
                // - Guardar en base de datos
                // - Enviar notificaciones
                // - Actualizar interfaz de usuario
                
            } catch (error) {
                console.error('Error al actualizar datos:', error);
            }
        }, 5 * 60 * 1000); // 5 minutos
        
    } catch (error) {
        console.error('Error al iniciar el monitor:', error);
    }
}

// Iniciar el monitoreo
monitorGPS().catch(console.error); 
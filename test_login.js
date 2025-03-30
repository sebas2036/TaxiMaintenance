const { openColsaGPSView, extractGPSData } = require('./logincolsa');

async function main() {
    try {
        console.log('Iniciando prueba de login Colsa...');
        const result = await openColsaGPSView();
        
        if (result.success) {
            console.log('Login exitoso. Screenshot guardado en:', result.screenshot);
            
            // Esperar un momento antes de extraer datos GPS
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Intentar extraer datos GPS
            const gpsData = await extractGPSData(result.page);
            console.log('Datos GPS extraídos:', gpsData);
            
            // Cerrar el navegador
            await result.browser.close();
        }
    } catch (error) {
        console.error('Error durante la prueba:', error);
        process.exit(1);
    }
}

main(); 
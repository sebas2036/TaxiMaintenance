const { openColsaGPSView } = require('./logincolsa');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForMapElements(page) {
    try {
        // Esperar a que el mapa esté presente
        await page.waitForFunction(() => {
            const map = document.querySelector('#map') || 
                       document.querySelector('.leaflet-container') ||
                       document.querySelector('.gm-style');
            return !!map;
        }, { timeout: 10000 }).catch(() => null);

        // Esperar a que Google Maps esté cargado
        await page.waitForFunction(() => {
            return window.google && window.google.maps;
        }, { timeout: 10000 }).catch(() => null);

        return true;
    } catch (error) {
        console.error('Error esperando elementos del mapa:', error);
        return false;
    }
}

async function extractMapInfo(page) {
    try {
        // Verificar si la página está disponible
        if (page.isClosed()) {
            return { error: 'La página está cerrada' };
        }

        // Esperar a que los elementos del mapa estén presentes
        const mapReady = await waitForMapElements(page);
        if (!mapReady) {
            return { error: 'No se pudo cargar el mapa correctamente' };
        }

        const mapInfo = await page.evaluate(() => {
            // Buscar el contenedor del mapa
            const mapContainer = document.querySelector('#map') || 
                               document.querySelector('.leaflet-container') ||
                               document.querySelector('.gm-style');
            
            if (!mapContainer) return { map: false };

            // Buscar vehículos
            const markers = Array.from(document.querySelectorAll('.leaflet-marker-icon, .vehicle-marker'));
            
            return {
                map: true,
                mapType: document.querySelector('.gm-style') ? 'google' : 'leaflet',
                size: {
                    width: mapContainer.clientWidth,
                    height: mapContainer.clientHeight
                },
                markers: markers.map(marker => {
                    const style = window.getComputedStyle(marker);
                    const transform = style.transform || style.webkitTransform;
                    let position = null;

                    if (transform && transform !== 'none') {
                        const matrix = transform.match(/matrix.*\((.+)\)/);
                        if (matrix) {
                            const values = matrix[1].split(', ');
                            position = {
                                x: parseFloat(values[4]),
                                y: parseFloat(values[5])
                            };
                        }
                    }

                    return {
                        position,
                        transform,
                        tooltip: marker.title || marker.alt,
                        className: marker.className
                    };
                })
            };
        });

        return mapInfo;
    } catch (error) {
        console.error('Error al extraer información del mapa:', error);
        return { error: error.message };
    }
}

async function main() {
    try {
        console.log('¿Deseas abrir la vista GPS? (s/n)');
        
        rl.question('', async (answer) => {
            if (answer.toLowerCase() !== 's') {
                console.log('Operación cancelada');
                rl.close();
                return;
            }

            console.log('Abriendo vista GPS...');
            const result = await openColsaGPSView();
            
            if (result && result.success) {
                console.log('Vista GPS abierta exitosamente');
                console.log('Presiona Ctrl+C para salir');
                
                // Esperar a que la página se estabilice
                await wait(5000);
                
                // Monitorear por 2 minutos
                const intervalo = 5000; // 5 segundos
                const duracion = 2 * 60 * 1000; // 2 minutos
                const iteraciones = duracion / intervalo;
                
                console.log('\nMonitoreando ubicaciones GPS...');
                console.log('Presiona Ctrl+C para detener\n');
                
                for (let i = 0; i < iteraciones; i++) {
                    try {
                        const info = await extractMapInfo(result.page);
                        
                        if (info.error) {
                            console.error(`Error en iteración ${i + 1}:`, info.error);
                            continue;
                        }
                        
                        console.log(`\nActualización ${i + 1}/${iteraciones}:`);
                        console.log('Tipo de mapa:', info.mapType);
                        console.log('Tamaño del mapa:', info.size);
                        console.log('Vehículos detectados:', info.markers.length);
                        
                        if (info.markers.length > 0) {
                            console.log('\nPosiciones de vehículos:');
                            info.markers.forEach((marker, idx) => {
                                console.log(`\nVehículo ${idx + 1}:`);
                                if (marker.position) {
                                    console.log('- Posición:', marker.position);
                                } else {
                                    console.log('- Transform:', marker.transform);
                                }
                                console.log('- Info:', marker.tooltip);
                            });
                        }
                        
                        await wait(intervalo);
                    } catch (error) {
                        console.error(`Error en iteración ${i + 1}:`, error);
                        await wait(intervalo);
                    }
                }
            } else {
                throw new Error('No se pudo abrir la vista GPS');
            }
            
            await result.browser.close();
            rl.close();
        });
    } catch (error) {
        console.error('Error durante el monitoreo:', error);
        rl.close();
        process.exit(1);
    }
}

main(); 
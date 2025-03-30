const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Configurar logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Crear directorio para screenshots si no existe
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

// Función para tomar screenshots de manera segura
async function takeScreenshot(page, name) {
    try {
        if (!page.isClosed()) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = path.join(screenshotsDir, `${name}-${timestamp}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            logger.info(`Screenshot guardado: ${screenshotPath}`);
            return screenshotPath;
        }
    } catch (error) {
        logger.error('Error al tomar screenshot:', error);
    }
}

// Función para esperar con un tiempo aleatorio
async function wait(ms) {
    const randomMs = ms + (Math.random() * 1000);
    return new Promise(resolve => setTimeout(resolve, randomMs));
}

// Función para verificar si Google Maps está cargado
async function waitForGoogleMaps(page) {
    try {
        await page.waitForFunction(() => {
            return window.google && window.google.maps;
        }, { timeout: 10000 });
        logger.info('Google Maps cargado correctamente');
        return true;
    } catch (error) {
        logger.error('Error al cargar Google Maps:', error);
        return false;
    }
}

async function openColsaGPSView() {
    let browser;
    try {
        logger.info('Iniciando navegador...');
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials'
            ]
        });

        const page = await browser.newPage();
        
        // Configurar timeouts más largos
        await page.setDefaultNavigationTimeout(60000);
        await page.setDefaultTimeout(30000);
        
        // Habilitar logging de consola del navegador
        page.on('console', msg => logger.info('Browser console:', msg.text()));
        
        // Navegar directamente a la vista GPS local
        const gpsViewPath = 'file:///Users/sebastianjasinsky/Desktop/mantenimiento%20flota%20taxi/FLOTATAXI/src/gps-view.html';
        logger.info('Navegando a la vista GPS local:', gpsViewPath);
        
        await page.goto(gpsViewPath, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Esperar a que la página cargue completamente
        await page.waitForFunction(() => document.readyState === 'complete');
        await wait(2000);

        // Tomar screenshot de manera segura
        await takeScreenshot(page, 'gps-view');

        // Verificar si la página se cargó correctamente
        const currentUrl = page.url();
        logger.info('URL actual:', currentUrl);

        if (currentUrl.includes('gps-view.html')) {
            logger.info('Vista GPS cargada exitosamente');
            return {
                success: true,
                page,
                browser
            };
        }
        
        throw new Error('No se pudo cargar la vista GPS');
    } catch (error) {
        logger.error('Error durante el proceso:', error);
        if (browser) {
            await browser.close();
        }
        throw error;
    }
}

module.exports = {
    openColsaGPSView
}; 
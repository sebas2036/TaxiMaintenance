const puppeteer = require('puppeteer');

async function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
}

async function loginColsa() {
    let browser;
    try {
        // Iniciar el navegador
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized', '--disable-web-security', '--no-sandbox']
        });

        // Crear una nueva página
        const page = await browser.newPage();

        // Configurar timeouts más largos
        await page.setDefaultNavigationTimeout(60000);
        await page.setDefaultTimeout(30000);

        // Ir a la página de Colsa
        console.log('Navegando a Colsa...');
        await page.goto('https://www.colsa.com.ar/gps');

        // Esperar a que la página se cargue completamente
        console.log('Esperando carga inicial...');
        await delay(5000);

        // Evaluar el contenido de la página
        const pageContent = await page.content();
        console.log('Contenido de la página cargado');

        // Buscar campos de usuario y contraseña
        console.log('Buscando campos de login...');
        
        // Intentar diferentes selectores para los campos
        const usernameSelectors = [
            'input[name="username"]',
            'input[type="text"]',
            'input[placeholder*="usuario"]',
            'input[placeholder*="email"]',
            '#username',
            '#user'
        ];

        const passwordSelectors = [
            'input[name="password"]',
            'input[type="password"]',
            'input[placeholder*="contraseña"]',
            '#password',
            '#pwd'
        ];

        // Esperar y encontrar el campo de usuario
        console.log('Buscando campo de usuario...');
        let usernameInput = null;
        for (const selector of usernameSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                usernameInput = await page.$(selector);
                if (usernameInput) {
                    console.log(`Campo de usuario encontrado: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`Intentando siguiente selector para usuario...`);
            }
        }

        // Esperar y encontrar el campo de contraseña
        console.log('Buscando campo de contraseña...');
        let passwordInput = null;
        for (const selector of passwordSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                passwordInput = await page.$(selector);
                if (passwordInput) {
                    console.log(`Campo de contraseña encontrado: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`Intentando siguiente selector para contraseña...`);
            }
        }

        if (!usernameInput || !passwordInput) {
            console.log('No se encontraron los campos de login. Contenido de la página:');
            console.log(pageContent);
            throw new Error('No se pudieron encontrar los campos de login');
        }

        // Ingresar credenciales
        console.log('Ingresando credenciales...');
        await usernameInput.click();
        await usernameInput.type('srjasinsky', {delay: 100});
        await passwordInput.click();
        await passwordInput.type('more2036', {delay: 100});

        // Buscar botón de login
        console.log('Buscando botón de login...');
        const buttonSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:contains("Ingresar")',
            'button:contains("Login")',
            'button:contains("Iniciar")',
            'input[value="Ingresar"]',
            'input[value="Login"]'
        ];

        let loginButton = null;
        for (const selector of buttonSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                loginButton = await page.$(selector);
                if (loginButton) {
                    console.log(`Botón de login encontrado: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`Intentando siguiente selector para botón...`);
            }
        }

        if (!loginButton) {
            console.log('No se encontró el botón de login. Contenido de la página:');
            console.log(pageContent);
            throw new Error('No se pudo encontrar el botón de login');
        }

        // Hacer clic en el botón
        console.log('Haciendo clic en el botón de login...');
        await loginButton.click();

        // Esperar a que se complete el login
        console.log('Esperando respuesta del servidor...');
        try {
            await page.waitForNavigation({
                waitUntil: 'networkidle0',
                timeout: 30000
            });
        } catch (e) {
            console.log('Timeout esperando navegación, continuando...');
        }

        console.log('Login completado');

        // Mantener el navegador abierto
        // await browser.close();

    } catch (error) {
        console.error('Error durante el login:', error);
        if (browser) {
            // await browser.close();
        }
    }
}

// Ejecutar el script
loginColsa(); 
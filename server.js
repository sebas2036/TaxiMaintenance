const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Servir archivos estáticos desde el directorio actual
app.use(express.static(__dirname));
console.log('Sirviendo archivos estáticos desde:', __dirname);

// Datos de ejemplo
const taxis = [
    {
        id: "1",
        modelo: "Toyota Corolla",
        año: 2020,
        conductor: "Juan Pérez",
        kilometraje: 50000,
        estado: "OK",
        ultimoMantenimiento: new Date()
    }
];

const mantenimientos = [
    {
        taxiId: "1",
        tipo: "Aceite y Filtros",
        fecha: new Date(),
        kilometraje: 50000,
        descripcion: "Cambio de aceite y filtros",
        costo: 1500,
        estado: "Completado"
    }
];

// Rutas API
app.get('/api/taxis', (req, res) => {
    res.json(taxis);
});

app.get('/api/taxis/:id', (req, res) => {
    const taxi = taxis.find(t => t.id === req.params.id);
    if (!taxi) {
        return res.status(404).json({ mensaje: 'Taxi no encontrado' });
    }
    res.json(taxi);
});

app.get('/api/mantenimientos/:taxiId', (req, res) => {
    const mantenimientosTaxi = mantenimientos.filter(m => m.taxiId === req.params.taxiId);
    res.json(mantenimientosTaxi);
});

app.post('/api/mantenimientos', (req, res) => {
    const nuevoMantenimiento = {
        ...req.body,
        id: Date.now().toString()
    };
    mantenimientos.push(nuevoMantenimiento);
    res.status(201).json(nuevoMantenimiento);
});

// Ruta para verificar que el servidor está funcionando
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Ruta para el frontend
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    console.log('Intentando servir:', indexPath);
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('index.html no encontrado');
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 8080; // Cambiar a puerto 8080
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Directorio base: ${__dirname}`);
    console.log(`Ruta al index.html: ${path.join(__dirname, 'index.html')}`);
    
    // Listar todos los archivos en el directorio actual
    console.log('Archivos en el directorio:');
    fs.readdirSync(__dirname).forEach(file => {
        console.log(' -', file);
    });
}); 
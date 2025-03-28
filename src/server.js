const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

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

// Ruta para el frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
}); 
const express = require('express');
const app = express();

// Ruta de prueba
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Iniciar servidor
const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de prueba corriendo en http://localhost:${PORT}`);
}); 
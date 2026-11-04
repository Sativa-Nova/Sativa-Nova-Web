const express = require('express');
const app = express();

// Middlewares necesarios
app.use(express.static('public'));
app.use(express.json()); // Vital para que el servidor entienda los JSON que envía la Pico W

// ==========================================
// AQUÍ VAN TUS RUTAS Y CONEXIÓN A LA BASE DE DATOS (PG / SOCKET.IO)
// ==========================================
// Ejemplo:
// app.post('/api/lecturas', (req, res) => { ... });

// ==========================================
// PUERTO DINÁMICO PARA RENDER (¡CRÍTICO!)
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor Sativa Nova corriendo exitosamente en el puerto ${PORT}`);
});
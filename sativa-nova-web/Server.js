const express = require('express');
const { Pool } = require('pg'); // Importante para conectar con Neon DB
const app = express();

// Middlewares necesarios
app.use(express.static('public'));
app.use(express.json()); // Vital para que el servidor entienda los JSON que envía la Pico W

// Configuración de la conexión a PostgreSQL (Neon) usando la variable de entorno
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario para conexiones seguras en la nube
    }
});

// ==========================================
// RUTA PARA RECIBIR LOS DATOS DE LA PICO W
// ==========================================
app.post('/api/lecturas', async (req, res) => {
    try {
        // Extraemos los datos que envía la Pico W (ajusta los nombres según tu código de MicroPython)
        const { temperatura, humedad, ph, tds, nivel_agua } = req.body;

        console.log("Datos recibidos de la Pico W:", req.body);

        // Consulta SQL para insertar los datos en tu tabla de Neon
        // Asegúrate de que tu tabla en Neon tenga columnas con estos nombres (o ajústalos)
        const query = `
            INSERT INTO lecturas (temperatura, humedad, ph, tds, nivel_agua, fecha) 
            VALUES ($1, $2, $3, $4, $5, NOW()) 
            RETURNING *;
        `;
        const values = [temperatura, humedad, ph, tds, nivel_agua];

        const result = await pool.query(query, values);

        // Respondemos a la Pico W confirmando que se guardó con éxito
        res.status(200).json({ 
            success: true, 
            message: 'Datos guardados exitosamente en Neon',
            data: result.rows[0] 
        });

    } catch (error) {
        console.error('Error al guardar en la base de datos:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ==========================================
// PUERTO DINÁMICO PARA RENDER (¡CRÍTICO!)
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor Sativa Nova corriendo exitosamente en el puerto ${PORT}`);
});
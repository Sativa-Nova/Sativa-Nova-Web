app.post('/api/lecturas', async (req, res) => {
    try {
        // Extraemos los campos exactos que envía tu Pico W
        const { 
            device_id, 
            temperatura_agua, 
            temperatura_ambiente, 
            humedad_ambiente, 
            humedad_suelo, 
            ph, 
            tds_ppm 
        } = req.body;

        console.log("Datos recibidos de la Pico W:", req.body);

        // Consulta SQL adaptada a tus columnas reales
        const query = `
            INSERT INTO lecturas (device_id, temperatura_agua, temperatura_ambiente, humedad_ambiente, humedad_suelo, ph, tds_ppm, fecha) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
            RETURNING *;
        `;
        const values = [
            device_id || 'pico_hidro_01', 
            temperatura_agua, 
            temperatura_ambiente, 
            humedad_ambiente, 
            humedad_suelo, 
            ph, 
            tds_ppm
        ];

        const result = await pool.query(query, values);

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
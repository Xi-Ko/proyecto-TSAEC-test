// Servidor Express extremadamente simple sin dependencias de base de datos
const express = require('express');
const app = express();
const PORT = 3001;

// Middleware básico
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Hola! Servidor TSAEC simple funcionando correctamente.');
});

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({
    error: false,
    mensaje: 'API de TSAEC funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
console.log(`Iniciando servidor simple en puerto ${PORT}...`);
app.listen(PORT, () => {
  console.log(`¡Servidor iniciado exitosamente en http://localhost:${PORT}!`);
});

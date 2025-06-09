// Servidor de prueba extremadamente simple
const express = require('express');
const app = express();
const PORT = 3001;

console.log('Iniciando servidor de prueba...');

// Ruta simple
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor de prueba está funcionando correctamente.');
});

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({
    error: false,
    mensaje: 'API de prueba funcionando correctamente',
    timestamp: new Date()
  });
});

// Iniciar servidor con manejo explícito de errores
const server = app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
})
.on('error', (error) => {
  console.error('Error al iniciar el servidor:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso.`);
  }
});

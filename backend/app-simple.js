// Servidor Express simplificado
const express = require('express');
const app = express();
const PORT = 3002;

console.log('=======================================');
console.log('INICIANDO SERVIDOR SIMPLIFICADO TSAEC');
console.log('=======================================');

// Configuración básica
app.use(express.json());

// Ruta de prueba
app.get('/api/status', (req, res) => {
  res.json({
    error: false,
    mensaje: 'API de TSAEC funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Iniciar servidor
console.log(`Intentando iniciar el servidor en el puerto ${PORT}...`);
app.listen(PORT, () => {
  console.log(`¡Servidor TSAEC iniciado exitosamente en el puerto ${PORT}!`);
  console.log(`API disponible en http://localhost:${PORT}/api/status`);
});

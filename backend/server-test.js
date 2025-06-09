// Servidor de prueba simplificado
const express = require('express');
const app = express();
const PORT = 3001;

console.log('=======================================');
console.log('INICIANDO SERVIDOR DE PRUEBA TSAEC');
console.log('=======================================');

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({
    error: false,
    mensaje: 'Servidor de prueba funcionando correctamente',
    timestamp: new Date()
  });
});

// Iniciar servidor
console.log('Iniciando servidor de prueba...');
app.listen(PORT, () => {
  console.log(`¡Servidor de prueba iniciado en el puerto ${PORT}!`);
  console.log(`Prueba disponible en http://localhost:${PORT}/api/test`);
});

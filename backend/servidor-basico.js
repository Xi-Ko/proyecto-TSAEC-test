// Servidor Express básico
const express = require('express');
const app = express();
const PORT = 5501;

console.log('=== Iniciando servidor básico ===');

// Ruta simple
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor básico está funcionando correctamente.');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

// Archivo principal de la aplicación simplificado
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

console.log('=======================================');
console.log('INICIANDO SERVIDOR PRINCIPAL TSAEC');
console.log('=======================================');

// Configuración de variables de entorno
dotenv.config();

// Puerto
const PORT = process.env.PORT || 3001;

// Crear aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor TSAEC simplificado está funcionando correctamente.');
});

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({
    error: false,
    mensaje: 'API de TSAEC funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Iniciar el servidor directamente
console.log(`Intentando iniciar el servidor en el puerto ${PORT}...`);
app.listen(PORT, () => {
  console.log(`¡Servidor TSAEC simplificado iniciado exitosamente en el puerto ${PORT}!`);
  console.log(`API disponible en http://localhost:${PORT}/api/status`);
});

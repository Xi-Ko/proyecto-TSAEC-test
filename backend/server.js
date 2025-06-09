// Servidor Express completo para TSAEC
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Cargar variables de entorno
dotenv.config();

// Importar modelos y rutas
const authRoutes = require('./routes/auth.js');
const comentariosRoutes = require('./routes/comentarios.js');
const { sequelize } = require('./db.js');

// Configuración básica
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware esencial
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    mensaje: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.'
  }
});

// Aplicar rate limiting a rutas sensibles
app.use('/api/auth', limiter);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/comentarios', comentariosRoutes);

// Endpoint de estado
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "TSAEC Backend"
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    error: true,
    mensaje: 'Error interno del servidor'
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    mensaje: 'Ruta no encontrada'
  });
});

// Función para iniciar el servidor
async function iniciarServidor() {
  try {
    // Verificar conexión a la base de datos
    console.log('Probando conexión a PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    
    // Sincronizar modelos con la base de datos
    console.log('Sincronizando modelos con la base de datos...');
    try {
      await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
      console.log('✅ Modelos sincronizados correctamente con la base de datos');
    } catch (syncError) {
      console.error('⚠️ Advertencia al sincronizar modelos:', syncError.message);
      console.log('   Continuando con el inicio del servidor...');
    }
    
    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      console.log('✅ Servidor TSAEC iniciado exitosamente');
      console.log(`   Puerto: ${PORT}`);
      console.log(`   API disponible en: http://localhost:${PORT}/api/status`);
      console.log(`   Autenticación: http://localhost:${PORT}/api/auth`);
      console.log(`   Comentarios: http://localhost:${PORT}/api/comentarios`);
    });
    
    // Manejar errores de inicio del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ ERROR: El puerto ${PORT} ya está en uso.`);
        console.error('   Solución: Cambia el puerto en el archivo .env o cierra la aplicación que usa ese puerto.');
      } else {
        console.error(`❌ ERROR al iniciar el servidor:`, error.message);
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR al conectar con PostgreSQL:', error.message);
    console.error('   Verifica que PostgreSQL esté en ejecución y que las credenciales sean correctas.');
    process.exit(1);
  }
}

// Iniciar el servidor
iniciarServidor();

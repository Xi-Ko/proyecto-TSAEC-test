// Archivo de prueba para la conexión a la base de datos
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

console.log('Intentando conectar a la base de datos con URL:', process.env.DATABASE_URL);

// Crear instancia de Sequelize con la URL de la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: true // Activar logs para ver qué sucede
});

// Función para probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return false;
  }
}

// Ejecutar la prueba
testConnection()
  .then(success => {
    if (success) {
      console.log('¡Prueba exitosa!');
    } else {
      console.log('La prueba falló.');
    }
    process.exit();
  });

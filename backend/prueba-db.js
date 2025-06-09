// Script para probar la conexión a la base de datos
const { sequelize, testConnection } = require('./db.js');

console.log('===========================================');
console.log('PRUEBA DE CONEXIÓN A LA BASE DE DATOS TSAEC');
console.log('===========================================');

console.log('Configuración de la base de datos:');
console.log(`URL: ${process.env.DATABASE_URL ? 'Configurada (valor oculto)' : 'No configurada'}`);

async function probarConexion() {
  try {
    console.log('Intentando conectar a la base de datos...');
    const resultado = await testConnection();
    
    if (resultado) {
      console.log('✅ CONEXIÓN EXITOSA: La base de datos está funcionando correctamente.');
    } else {
      console.log('❌ ERROR: No se pudo establecer conexión con la base de datos.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR GRAVE:', error);
    process.exit(1);
  }
}

probarConexion();

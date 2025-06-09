// Middleware de autenticación
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Usuario = require('../models/Usuario.js');

dotenv.config();

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: true, 
        mensaje: 'Acceso no autorizado. Token no proporcionado' 
      });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findByPk(decodificado.id);
    
    // Verificar si el usuario existe y está activo
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ 
        error: true, 
        mensaje: 'Usuario no encontrado o desactivado' 
      });
    }
    
    // Agregar el usuario al objeto de solicitud
    req.usuario = usuario;
    
    // Actualizar última conexión
    await usuario.update({ ultima_conexion: new Date() });
    
    // Continuar con la siguiente función
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: true, 
        mensaje: 'El token ha expirado. Por favor, inicie sesión nuevamente' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: true, 
        mensaje: 'Token inválido' 
      });
    }
    
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({ 
      error: true, 
      mensaje: 'Error interno del servidor' 
    });
  }
};

// Middleware para verificar roles
const verificarRol = (roles = []) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        error: true, 
        mensaje: 'Acceso no autorizado' 
      });
    }
    
    if (roles.length && !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: true, 
        mensaje: 'No tiene permisos para realizar esta acción' 
      });
    }
    
    next();
  };
};

module.exports = { verificarToken, verificarRol };

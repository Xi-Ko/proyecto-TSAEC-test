// Rutas de autenticación
const express = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario.js');
const Perfil = require('../models/Perfil.js');
const { verificarToken } = require('../middleware/auth.js');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();

// Ruta para registro de usuarios
router.post('/registro', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;
    
    // Validaciones básicas
    if (!email || !password || !nombre) {
      return res.status(400).json({
        error: true,
        mensaje: 'Todos los campos son obligatorios'
      });
    }
    
    // Verificar si el email ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'El email ya está registrado'
      });
    }
    
    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      email,
      password, // Se hashea automáticamente en el hook beforeCreate
      nombre
    });
    
    // Crear perfil asociado
    await Perfil.create({
      usuario_id: nuevoUsuario.id
    });
    
    // Generar token JWT
    const token = jwt.sign(
      { id: nuevoUsuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Respuesta exitosa
    return res.status(201).json({
      error: false,
      mensaje: 'Usuario registrado correctamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol
      }
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al registrar usuario'
    });
  }
});

// Ruta para inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        mensaje: 'Email y contraseña son obligatorios'
      });
    }
    
    // Buscar usuario por email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        error: true,
        mensaje: 'Credenciales inválidas'
      });
    }
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        error: true,
        mensaje: 'Usuario desactivado. Contacte al administrador'
      });
    }
    
    // Verificar contraseña
    const passwordValida = await usuario.validarPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        error: true,
        mensaje: 'Credenciales inválidas'
      });
    }
    
    // Actualizar última conexión
    await usuario.update({ ultima_conexion: new Date() });
    
    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Respuesta exitosa
    return res.status(200).json({
      error: false,
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al iniciar sesión'
    });
  }
});

// Ruta para obtener perfil del usuario actual
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    // Buscar perfil del usuario
    const perfil = await Perfil.findOne({
      where: { usuario_id: req.usuario.id }
    });
    
    if (!perfil) {
      return res.status(404).json({
        error: true,
        mensaje: 'Perfil no encontrado'
      });
    }
    
    // Respuesta exitosa
    return res.status(200).json({
      error: false,
      usuario: {
        id: req.usuario.id,
        email: req.usuario.email,
        nombre: req.usuario.nombre,
        rol: req.usuario.rol,
        creado_en: req.usuario.creado_en
      },
      perfil
    });
    
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al obtener perfil'
    });
  }
});

// --- INICIO: Autenticación con Google ---
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1026739591381-n0i2iq3jbunvdadn6r5m06b5msnec4gi.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Endpoint para login/registro con Google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: true, mensaje: 'Token de Google requerido' });
    }

    // Verificar token de Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    if (!email) {
      return res.status(400).json({ error: true, mensaje: 'No se pudo obtener el correo de Google' });
    }

    // Buscar usuario por email
    let usuario = await Usuario.findOne({ where: { email } });
    let nuevo = false;
    if (!usuario) {
      // Crear usuario nuevo
      usuario = await Usuario.create({
        email,
        nombre: name || email.split('@')[0],
        password: sub, // Se puede poner un hash random, ya que no se usará
        avatar: picture || null,
        autenticacion: 'google',
        activo: true
      });
      await Perfil.create({ usuario_id: usuario.id, avatar: picture || null });
      nuevo = true;
    } else {
      // Actualizar avatar si viene uno nuevo
      if (picture && usuario.avatar !== picture) {
        usuario.avatar = picture;
        await usuario.save();
        const perfil = await Perfil.findOne({ where: { usuario_id: usuario.id } });
        if (perfil) {
          perfil.avatar = picture;
          await perfil.save();
        }
      }
    }

    // Generar token JWT propio
    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      error: false,
      mensaje: nuevo ? 'Usuario registrado con Google' : 'Login con Google exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        avatar: usuario.avatar,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login/registro Google:', error);
    return res.status(500).json({ error: true, mensaje: 'Error autenticando con Google' });
  }
});
// --- FIN: Autenticación con Google ---

// Ruta para actualizar perfil
router.put('/perfil', verificarToken, async (req, res) => {
  try {
    const { nombre, bio, ciudad, intereses, redes_sociales, avatar } = req.body;
    
    // Actualizar datos del usuario
    if (nombre) {
      await req.usuario.update({ nombre });
    }
    
    // Buscar y actualizar perfil
    const perfil = await Perfil.findOne({
      where: { usuario_id: req.usuario.id }
    });
    
    if (!perfil) {
      return res.status(404).json({
        error: true,
        mensaje: 'Perfil no encontrado'
      });
    }
    
    // Actualizar campos del perfil
    await perfil.update({
      bio: bio !== undefined ? bio : perfil.bio,
      ciudad: ciudad !== undefined ? ciudad : perfil.ciudad,
      intereses: intereses !== undefined ? intereses : perfil.intereses,
      redes_sociales: redes_sociales !== undefined ? redes_sociales : perfil.redes_sociales,
      avatar: avatar !== undefined ? avatar : perfil.avatar
    });
    
    // Respuesta exitosa
    return res.status(200).json({
      error: false,
      mensaje: 'Perfil actualizado correctamente',
      usuario: {
        id: req.usuario.id,
        email: req.usuario.email,
        nombre: req.usuario.nombre
      },
      perfil
    });
    
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al actualizar perfil'
    });
  }
});

// Ruta para cambiar contraseña
router.put('/cambiar-password', verificarToken, async (req, res) => {
  try {
    const { password_actual, password_nueva } = req.body;
    
    // Validaciones básicas
    if (!password_actual || !password_nueva) {
      return res.status(400).json({
        error: true,
        mensaje: 'Ambas contraseñas son obligatorias'
      });
    }
    
    if (password_nueva.length < 8) {
      return res.status(400).json({
        error: true,
        mensaje: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }
    
    // Verificar contraseña actual
    const passwordValida = await req.usuario.validarPassword(password_actual);
    if (!passwordValida) {
      return res.status(401).json({
        error: true,
        mensaje: 'La contraseña actual es incorrecta'
      });
    }
    
    // Actualizar contraseña
    await req.usuario.update({ password: password_nueva });
    
    // Respuesta exitosa
    return res.status(200).json({
      error: false,
      mensaje: 'Contraseña actualizada correctamente'
    });
    
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al cambiar contraseña'
    });
  }
});

module.exports = router;

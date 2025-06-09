// Rutas para gestión de comentarios
const express = require('express');
const Comentario = require('../models/Comentario.js');
const Usuario = require('../models/Usuario.js');
const { verificarToken, verificarRol } = require('../middleware/auth.js');

const router = express.Router();

// Middleware para verificar si un comentario existe
const verificarComentario = async (req, res, next) => {
  try {
    const comentarioId = req.params.id;
    const comentario = await Comentario.findByPk(comentarioId);
    
    if (!comentario) {
      return res.status(404).json({
        error: true,
        mensaje: 'Comentario no encontrado'
      });
    }
    
    req.comentario = comentario;
    next();
  } catch (error) {
    console.error('Error al verificar comentario:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar si el usuario es propietario del comentario
const verificarPropietario = (req, res, next) => {
  if (req.usuario.id !== req.comentario.usuario_id && req.usuario.rol !== 'admin' && req.usuario.rol !== 'moderador') {
    return res.status(403).json({
      error: true,
      mensaje: 'No tienes permiso para realizar esta acción'
    });
  }
  next();
};

// Obtener todos los comentarios principales (no respuestas)
router.get('/', async (req, res) => {
  try {
    const { pagina = 1, limite = 10, incluirAvatar = false } = req.query;
    const offset = (pagina - 1) * limite;
    
    const comentarios = await Comentario.findAndCountAll({
      where: {
        comentario_padre_id: null,
        estado: 'activo'
      },
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'avatar']
        }
      ],
      order: [['creado_en', 'DESC']],
      limit: parseInt(limite),
      offset: parseInt(offset)
    });
    
    return res.status(200).json({
      error: false,
      total: comentarios.count,
      paginas: Math.ceil(comentarios.count / limite),
      pagina_actual: parseInt(pagina),
      comentarios: comentarios.rows
    });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al obtener comentarios'
    });
  }
});

// Obtener un comentario específico con sus respuestas
router.get('/:id', async (req, res) => {
  try {
    const comentarioId = req.params.id;
    
    const comentario = await Comentario.findOne({
      where: {
        id: comentarioId,
        estado: 'activo'
      },
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'avatar']
        },
        {
          model: Comentario,
          as: 'respuestas',
          where: {
            estado: 'activo'
          },
          include: [
            {
              model: Usuario,
              attributes: ['id', 'nombre', 'avatar']
            }
          ],
          required: false
        }
      ]
    });
    
    if (!comentario) {
      return res.status(404).json({
        error: true,
        mensaje: 'Comentario no encontrado'
      });
    }
    
    return res.status(200).json({
      error: false,
      comentario
    });
  } catch (error) {
    console.error('Error al obtener comentario:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al obtener comentario'
    });
  }
});

// Crear un nuevo comentario
router.post('/', verificarToken, async (req, res) => {
  try {
    const { contenido, comentario_padre_id, calificacion } = req.body;
    
    // Validaciones básicas
    if (!contenido) {
      return res.status(400).json({
        error: true,
        mensaje: 'El contenido del comentario es obligatorio'
      });
    }
    
    // Si es una respuesta, verificar que el comentario padre exista
    if (comentario_padre_id) {
      const comentarioPadre = await Comentario.findByPk(comentario_padre_id);
      if (!comentarioPadre || comentarioPadre.estado !== 'activo') {
        return res.status(404).json({
          error: true,
          mensaje: 'El comentario padre no existe o no está disponible'
        });
      }
    }
    
    // Crear el comentario
    const nuevoComentario = await Comentario.create({
      usuario_id: req.usuario.id,
      contenido,
      comentario_padre_id: comentario_padre_id || null,
      calificacion: calificacion || null // Añadir calificacion
    });
    
    // Obtener el comentario con datos del usuario
    const comentarioConUsuario = await Comentario.findByPk(nuevoComentario.id, {
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'avatar'] // Añadir avatar
        }
      ]
    });
    
    return res.status(201).json({
      error: false,
      mensaje: 'Comentario creado correctamente',
      comentario: comentarioConUsuario
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al crear comentario'
    });
  }
});

// Actualizar un comentario
router.put('/:id', [verificarToken, verificarComentario, verificarPropietario], async (req, res) => {
  try {
    const { contenido } = req.body;
    
    // Validaciones básicas
    if (!contenido) {
      return res.status(400).json({
        error: true,
        mensaje: 'El contenido del comentario es obligatorio'
      });
    }
    
    // Actualizar el comentario
    await req.comentario.update({ contenido });
    
    return res.status(200).json({
      error: false,
      mensaje: 'Comentario actualizado correctamente',
      comentario: req.comentario
    });
  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al actualizar comentario'
    });
  }
});

// Eliminar un comentario (marcar como eliminado)
router.delete('/:id', [verificarToken, verificarComentario, verificarPropietario], async (req, res) => {
  try {
    // Marcar como eliminado (soft delete)
    await req.comentario.update({ estado: 'eliminado' });
    
    return res.status(200).json({
      error: false,
      mensaje: 'Comentario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al eliminar comentario'
    });
  }
});

// Reportar un comentario
router.post('/:id/reportar', [verificarToken, verificarComentario], async (req, res) => {
  try {
    const { motivo } = req.body;
    
    if (!motivo) {
      return res.status(400).json({
        error: true,
        mensaje: 'El motivo del reporte es obligatorio'
      });
    }
    
    // Incrementar contador de reportes
    await req.comentario.increment('reportes');
    
    // Si supera un umbral, ocultar automáticamente (ejemplo: 5 reportes)
    if (req.comentario.reportes >= 5) {
      await req.comentario.update({ estado: 'oculto' });
    }
    
    return res.status(200).json({
      error: false,
      mensaje: 'Comentario reportado correctamente'
    });
  } catch (error) {
    console.error('Error al reportar comentario:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al reportar comentario'
    });
  }
});

// Dar like a un comentario
router.post('/:id/like', [verificarToken, verificarComentario], async (req, res) => {
  try {
    // Incrementar contador de likes
    await req.comentario.increment('likes');
    
    return res.status(200).json({
      error: false,
      mensaje: 'Like registrado correctamente',
      likes: req.comentario.likes + 1
    });
  } catch (error) {
    console.error('Error al dar like:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al dar like'
    });
  }
});

// Obtener respuestas de un comentario
router.get('/:id/respuestas', async (req, res) => {
  try {
    const comentarioId = req.params.id;
    const { pagina = 1, limite = 10 } = req.query;
    const offset = (pagina - 1) * limite;
    
    const respuestas = await Comentario.findAndCountAll({
      where: {
        comentario_padre_id: comentarioId,
        estado: 'activo'
      },
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'avatar'] // Añadir avatar
        }
      ],
      order: [['creado_en', 'ASC']],
      limit: parseInt(limite),
      offset: parseInt(offset)
    });
    
    return res.status(200).json({
      error: false,
      total: respuestas.count,
      paginas: Math.ceil(respuestas.count / limite),
      pagina_actual: parseInt(pagina),
      respuestas: respuestas.rows
    });
  } catch (error) {
    console.error('Error al obtener respuestas:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al obtener respuestas'
    });
  }
});

// Ruta para moderadores: moderar comentario
router.put('/:id/moderar', [
  verificarToken, 
  verificarComentario, 
  verificarRol(['admin', 'moderador'])
], async (req, res) => {
  try {
    const { estado, nota_moderacion } = req.body;
    
    if (!estado || !['activo', 'oculto', 'eliminado'].includes(estado)) {
      return res.status(400).json({
        error: true,
        mensaje: 'Estado de moderación inválido'
      });
    }
    
    // Actualizar estado del comentario
    await req.comentario.update({ 
      estado,
      nota_moderacion: nota_moderacion || null
    });
    
    return res.status(200).json({
      error: false,
      mensaje: 'Comentario moderado correctamente'
    });
  } catch (error) {
    console.error('Error al moderar comentario:', error);
    return res.status(500).json({
      error: true,
      mensaje: 'Error al moderar comentario'
    });
  }
});

module.exports = router;

// Modelo de Comentarios
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');
const Usuario = require('./Usuario.js');

const Comentario = sequelize.define('Comentario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El comentario no puede estar vacío'
      },
      len: {
        args: [2, 1000],
        msg: 'El comentario debe tener entre 2 y 1000 caracteres'
      }
    }
  },
  comentario_padre_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Comentarios',
      key: 'id'
    }
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reportes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.ENUM('activo', 'oculto', 'eliminado'),
    defaultValue: 'activo'
  },
  calificacion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

// Establecer relaciones
Usuario.hasMany(Comentario, { foreignKey: 'usuario_id', as: 'comentarios' });
Comentario.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Relación para comentarios anidados
Comentario.hasMany(Comentario, { foreignKey: 'comentario_padre_id', as: 'respuestas' });
Comentario.belongsTo(Comentario, { foreignKey: 'comentario_padre_id', as: 'comentario_padre' });

module.exports = Comentario;

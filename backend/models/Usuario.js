// Modelo de Usuario
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');
const bcrypt = require('bcrypt');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'El email debe tener un formato válido'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [8, 100],
        msg: 'La contraseña debe tener al menos 8 caracteres'
      }
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('usuario', 'moderador', 'admin'),
    defaultValue: 'usuario'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ultima_conexion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
      }
    }
  }
});

// Método para comparar contraseñas
Usuario.prototype.validarPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Usuario;

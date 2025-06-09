// Modelo de Perfil de Usuario
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');
const Usuario = require('./Usuario.js');

const Perfil = sequelize.define('Perfil', {
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
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '/assets/img/default-avatar.png'
  },
  bio: {
    type: DataTypes.TEXT
  },
  ciudad: {
    type: DataTypes.STRING
  },
  intereses: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  redes_sociales: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  puntos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  nivel: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  logros: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

// Establecer relación con Usuario
Usuario.hasOne(Perfil, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
Perfil.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = Perfil;

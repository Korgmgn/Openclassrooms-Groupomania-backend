'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ post, comment }) {
      // define association here
      this.hasMany(post, { foreignKey: 'userId', as: 'posts', onDelete: 'CASCADE', hooks: true })
      this.hasMany(comment, { foreignKey: 'userId', as: 'comments', onDelete: 'CASCADE', hooks: true })
    }
    //Modifie la réponse par défaut afin de cacher l'id
    toJSON(){
        return { ...this.get(), id: undefined }
    }
  };
  user.init({
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    admin: {
        type: DataTypes.STRING,
        defaultValue: 'user'
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'User must have a name' },
            notEmpty: { msg: 'Name must not be empty' },
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'User must choose an email' },
            notEmpty: { msg: 'Email must not be empty' },
            isEmail: { msg: 'Email must be valid'}
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
  }, {
    sequelize,
    tableName: 'users',
    modelName: 'user',
  });
  return user;
};
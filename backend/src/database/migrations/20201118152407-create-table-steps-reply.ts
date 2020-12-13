import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("StepsReply", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      reply: {
        type: DataTypes.STRING,
        allowNull: false
      },
      stepOrder: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      idAutoReply: {
        type: DataTypes.INTEGER,
        references: { model: "AutoReply", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      action: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("StepsReply");
  }
};

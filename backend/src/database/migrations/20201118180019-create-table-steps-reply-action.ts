import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("StepsReplyActions", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      stepReplyId: {
        type: DataTypes.INTEGER,
        references: { model: "StepsReply", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      words: {
        type: DataTypes.STRING,
        allowNull: false
      },
      action: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reply: {
        type: DataTypes.STRING,
        allowNull: false
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
    return queryInterface.dropTable("StepsReplyActions");
  }
};

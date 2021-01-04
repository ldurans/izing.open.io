import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("AutoReplyLogs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      autoReplyId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      autoReplyName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      stepsReplyId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      stepsReplyMessage: {
        type: DataTypes.STRING,
        allowNull: false
      },
      wordsReply: {
        type: DataTypes.STRING,
        allowNull: false
      },
      contactId: {
        type: DataTypes.INTEGER,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict"
      },
      ticketId: {
        type: DataTypes.INTEGER,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("AutoReplyLogs");
  }
};

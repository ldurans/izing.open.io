import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tickets", "queue");
    await queryInterface.addColumn("Tickets", "queue", {
      type: DataTypes.INTEGER,
      references: { model: "Queues", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "restrict",
      defaultValue: null,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tickets", "queue");
    await queryInterface.addColumn("Tickets", "queue", {
      type: DataTypes.INTEGER,
      // references: { model: "ServiceQueue", key: "id" },
      // onUpdate: "CASCADE",
      // onDelete: "CASCADE",
      defaultValue: null,
      allowNull: true
    });
  }
};

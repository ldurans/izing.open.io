import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tickets", "queue"),
      queryInterface.addColumn("Tickets", "queue", {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        defaultValue: null,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tickets", "queue"),
      queryInterface.addColumn("Tickets", "queue", {
        type: DataTypes.INTEGER,
        // references: { model: "ServiceQueue", key: "id" },
        // onUpdate: "CASCADE",
        // onDelete: "CASCADE",
        defaultValue: null,
        allowNull: true
      })
    ]);
  }
};

import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "queue", {
      type: DataTypes.INTEGER,
      // references: { model: "ServiceQueue", key: "id" },
      // onUpdate: "CASCADE",
      // onDelete: "CASCADE",
      defaultValue: null,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "queue");
  }
};

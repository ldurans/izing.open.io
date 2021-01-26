import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeConstraint("Contacts", "Contacts_number_key")
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addConstraint("Contacts", ["number"], {
        type: "unique",
        name: "Contacts_number_key"
      })
    ]);
  }
};

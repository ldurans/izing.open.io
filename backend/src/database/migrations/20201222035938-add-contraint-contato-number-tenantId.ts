import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addConstraint("Contacts", ["number", "tenantId"], {
        type: "unique",
        name: "unique_constraint_contact_number_tenant"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeConstraint(
        "Contacts",
        "unique_constraint_contact_number_tenant"
      )
    ]);
  }
};

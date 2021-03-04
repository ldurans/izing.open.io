import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.createTable("CampaignContacts", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        messageRandom: {
          type: DataTypes.STRING,
          allowNull: false
        },
        messageId: {
          type: DataTypes.STRING,
          references: { model: "Messages", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
        },
        contactId: {
          type: DataTypes.INTEGER,
          references: { model: "Contacts", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        },
        campaignId: {
          type: DataTypes.INTEGER,
          references: { model: "Campaigns", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false,
          defaultValue: 0
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([queryInterface.dropTable("CampaignContacts")]);
  }
};

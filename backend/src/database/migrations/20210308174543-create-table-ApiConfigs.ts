import { QueryInterface, DataTypes, Sequelize } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.createTable("ApiConfigs", {
        id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.UUID,
          defaultValue: Sequelize.literal("uuid_generate_v4()")
        },
        sessionId: {
          type: DataTypes.INTEGER,
          references: { model: "Whatsapps", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: ""
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        token: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        userId: {
          type: DataTypes.INTEGER,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
        },
        tenantId: {
          type: DataTypes.INTEGER,
          references: { model: "Tenants", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false,
          defaultValue: 1
        },
        urlDelivery: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
          validate: {
            isUrl: true
          }
        },
        urlServiceStatus: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
          validate: {
            isUrl: true
          }
        },
        urlMessageStatus: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
          validate: {
            isUrl: true
          }
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
    return Promise.all([queryInterface.dropTable("ApiConfigs")]);
  }
};

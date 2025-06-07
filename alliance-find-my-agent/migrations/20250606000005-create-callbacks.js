"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("callbacks", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      agentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "agents",
          key: "id",
        },
      },
      clientName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      clientEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      clientPhone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      purpose: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "scheduled", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex("callbacks", ["agentId"]);
    await queryInterface.addIndex("callbacks", ["status"]);
    await queryInterface.addIndex("callbacks", ["scheduledAt"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("callbacks");
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("complaints", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      targetId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      targetRole: {
        type: Sequelize.ENUM("agent", "employee"),
        allowNull: false,
      },
      complainantId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      complainantEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      complainantName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("open", "under-review", "resolved", "closed"),
        allowNull: false,
        defaultValue: "open",
      },
      resolution: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex("complaints", ["targetId"]);
    await queryInterface.addIndex("complaints", ["targetRole"]);
    await queryInterface.addIndex("complaints", ["complainantId"]);
    await queryInterface.addIndex("complaints", ["status"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("complaints");
  },
};

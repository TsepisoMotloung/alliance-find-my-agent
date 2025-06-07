"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ratings", {
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
      raterId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      raterEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      raterName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
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
    await queryInterface.addIndex("ratings", ["targetId"]);
    await queryInterface.addIndex("ratings", ["targetRole"]);
    await queryInterface.addIndex("ratings", ["raterId"]);
    await queryInterface.addIndex("ratings", ["score"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ratings");
  },
};

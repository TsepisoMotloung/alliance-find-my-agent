
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("question_ratings", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      ratingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "ratings",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      questionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "questions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
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
    await queryInterface.addIndex("question_ratings", ["ratingId"]);
    await queryInterface.addIndex("question_ratings", ["questionId"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("question_ratings");
  },
};

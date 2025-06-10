
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      targetRole: {
        type: Sequelize.ENUM('agent', 'employee'),
        allowNull: false
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add some default questions
    await queryInterface.bulkInsert('questions', [
      {
        id: require('uuid').v4(),
        targetRole: 'agent',
        question: 'How would you rate the overall service quality?',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        targetRole: 'agent',
        question: 'How responsive was the agent to your needs?',
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        targetRole: 'employee',
        question: 'How would you rate the employee\'s professionalism?',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        targetRole: 'employee',
        question: 'How helpful was the employee in resolving your issue?',
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('questions');
  }
};

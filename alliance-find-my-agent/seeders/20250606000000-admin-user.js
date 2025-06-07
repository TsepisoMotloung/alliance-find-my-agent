'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await queryInterface.bulkInsert('users', [{
      id: adminId,
      email: 'admin@alliance-insurance.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      approvalStatus: 'approved',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { role: 'admin' }, {});
  }
};
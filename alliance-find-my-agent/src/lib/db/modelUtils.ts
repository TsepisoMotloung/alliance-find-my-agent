
import sequelize from '../db';

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

export async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully.');
    return true;
  } catch (error) {
    console.error('Database sync failed:', error);
    return false;
  }
}

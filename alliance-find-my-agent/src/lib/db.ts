import { Sequelize } from "sequelize";

// Import environment variables
const dbName = process.env.DB_NAME!;
const dbUser = process.env.DB_USER!;
const dbPassword = process.env.DB_PASS!;
const dbHost = process.env.DB_HOST!;
const dbPort = parseInt(process.env.DB_PORT || "3306");

// Create Sequelize instance
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  dialectModule: require("mysql2"),
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
  },
  timezone: "+00:00",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
});

// Function to test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    return true;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return false;
  }
};

export default sequelize;

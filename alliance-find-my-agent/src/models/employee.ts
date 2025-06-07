import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";
import { IEmployee } from "@/types/models";
import { v4 as uuidv4 } from "uuid";
import User from "./user";

// Interface for Employee creation attributes
interface EmployeeCreationAttributes
  extends Optional<
    IEmployee,
    "id" | "createdAt" | "updatedAt" | "averageRating"
  > {}

// Employee model
class Employee
  extends Model<IEmployee, EmployeeCreationAttributes>
  implements IEmployee
{
  public id!: string;
  public userId!: string;
  public employeeId!: string;
  public department!: string;
  public position!: string;
  public averageRating?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Employee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    averageRating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
  },
);

// Define association
Employee.belongsTo(User, { foreignKey: "userId", as: "user" });

export default Employee;

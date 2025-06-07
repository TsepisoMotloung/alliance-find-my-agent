import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";
import { IComplaint } from "@/types/models";
import { v4 as uuidv4 } from "uuid";
import User from "./user";

// Interface for Complaint creation attributes
interface ComplaintCreationAttributes
  extends Optional<
    IComplaint,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "resolution"
    | "complainantId"
    | "complainantEmail"
    | "complainantName"
  > {}

// Complaint model
class Complaint
  extends Model<IComplaint, ComplaintCreationAttributes>
  implements IComplaint
{
  public id!: string;
  public targetId!: string;
  public targetRole!: "agent" | "employee";
  public complainantId?: string;
  public complainantEmail?: string;
  public complainantName?: string;
  public subject!: string;
  public description!: string;
  public status!: "open" | "under-review" | "resolved" | "closed";
  public resolution?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Complaint.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    targetRole: {
      type: DataTypes.ENUM("agent", "employee"),
      allowNull: false,
    },
    complainantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    complainantEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    complainantName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("open", "under-review", "resolved", "closed"),
      allowNull: false,
      defaultValue: "open",
    },
    resolution: {
      type: DataTypes.TEXT,
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
    modelName: "Complaint",
    tableName: "complaints",
  },
);

// Define associations
Complaint.belongsTo(User, {
  foreignKey: "targetId",
  as: "target",
  constraints: false,
});
Complaint.belongsTo(User, {
  foreignKey: "complainantId",
  as: "complainant",
  constraints: false,
});

export default Complaint;

import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";
import { ICallback } from "@/types/models";
import { v4 as uuidv4 } from "uuid";
import Agent from "./agent";

// Interface for Callback creation attributes
interface CallbackCreationAttributes
  extends Optional<
    ICallback,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "notes"
    | "clientEmail"
    | "scheduledAt"
    | "completedAt"
  > {}

// Callback model
class Callback
  extends Model<ICallback, CallbackCreationAttributes>
  implements ICallback
{
  public id!: string;
  public agentId!: string;
  public clientName!: string;
  public clientEmail?: string;
  public clientPhone!: string;
  public purpose!: string;
  public status!: "pending" | "scheduled" | "completed" | "cancelled";
  public notes?: string;
  public scheduledAt?: Date;
  public completedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Mark as scheduled
  public async schedule(scheduledAt: Date, notes?: string): Promise<void> {
    this.scheduledAt = scheduledAt;
    this.status = "scheduled";
    if (notes) this.notes = notes;
    await this.save();
  }

  // Mark as completed
  public async complete(notes?: string): Promise<void> {
    this.completedAt = new Date();
    this.status = "completed";
    if (notes) this.notes = notes;
    await this.save();
  }

  // Cancel callback
  public async cancel(notes?: string): Promise<void> {
    this.status = "cancelled";
    if (notes) this.notes = notes;
    await this.save();
  }
}

Callback.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "agents",
        key: "id",
      },
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clientEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    clientPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "scheduled", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
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
    modelName: "Callback",
    tableName: "callbacks",
  },
);

// Define association
Callback.belongsTo(Agent, { foreignKey: "agentId", as: "agent" });

export default Callback;

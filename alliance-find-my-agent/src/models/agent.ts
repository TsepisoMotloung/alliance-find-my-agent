import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";
import { IAgent } from "@/types/models";
import { v4 as uuidv4 } from "uuid";
import User from "./user";

// Interface for Agent creation attributes
interface AgentCreationAttributes
  extends Optional<
    IAgent,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "isAvailable"
    | "averageRating"
    | "latitude"
    | "longitude"
    | "locationUpdatedAt"
  > {}

// Agent model
class Agent extends Model<IAgent, AgentCreationAttributes> implements IAgent {
  public id!: string;
  public userId!: string;
  public licenseNumber!: string;
  public specialization?: string;
  public latitude?: number;
  public longitude?: number;
  public locationUpdatedAt?: Date;
  public isAvailable!: boolean;
  public averageRating?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Check if location is recent (within the last hour)
  public isLocationRecent(): boolean {
    if (!this.locationUpdatedAt) return false;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.locationUpdatedAt > oneHourAgo;
  }

  // Update location
  public async updateLocation(
    latitude: number,
    longitude: number,
  ): Promise<void> {
    this.latitude = latitude;
    this.longitude = longitude;
    this.locationUpdatedAt = new Date();
    await this.save();
  }
}

Agent.init(
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
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    locationUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: "Agent",
    tableName: "agents",
  },
);

export default Agent;
export {Agent};

import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";
import { IRating } from "@/types/models";
import { v4 as uuidv4 } from "uuid";
import User from "./user";
import Agent from "./agent";
import Employee from "./employee";

// Interface for Rating creation attributes
interface RatingCreationAttributes
  extends Optional<
    IRating,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "comment"
    | "raterId"
    | "raterEmail"
    | "raterName"
  > {}

// Rating model
class Rating
  extends Model<IRating, RatingCreationAttributes>
  implements IRating
{
  public id!: string;
  public targetId!: string;
  public targetRole!: "agent" | "employee";
  public raterId?: string;
  public raterEmail?: string;
  public raterName?: string;
  public score!: number;
  public comment?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Calculate average rating for a target
  public static async calculateAverageRating(
    targetId: string,
    targetRole: "agent" | "employee",
  ): Promise<number | null> {
    const ratings = await this.findAll({
      where: { targetId, targetRole },
      attributes: ["score"],
    });

    if (ratings.length === 0) return null;

    const sum = ratings.reduce((total, rating) => total + rating.score, 0);
    return parseFloat((sum / ratings.length).toFixed(1));
  }

  // Update target's average rating
  public static async updateTargetAverageRating(
    targetId: string,
    targetRole: "agent" | "employee",
  ): Promise<void> {
    const averageRating = await this.calculateAverageRating(
      targetId,
      targetRole,
    );

    if (targetRole === "agent") {
      const agent = await Agent.findOne({
        where: { userId: targetId },
      });
      if (agent) {
        agent.averageRating = averageRating || undefined;
        await agent.save();
      }
    } else if (targetRole === "employee") {
      const employee = await Employee.findOne({
        where: { userId: targetId },
      });
      if (employee) {
        employee.averageRating = averageRating || undefined;
        await employee.save();
      }
    }
  }
}

Rating.init(
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
    raterId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    raterEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    raterName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
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
    modelName: "Rating",
    tableName: "ratings",
    hooks: {
      afterCreate: async (rating: Rating) => {
        await Rating.updateTargetAverageRating(
          rating.targetId,
          rating.targetRole,
        );
      },
      afterUpdate: async (rating: Rating) => {
        await Rating.updateTargetAverageRating(
          rating.targetId,
          rating.targetRole,
        );
      },
      afterDestroy: async (rating: Rating) => {
        await Rating.updateTargetAverageRating(
          rating.targetId,
          rating.targetRole,
        );
      },
    },
  },
);

// Define associations
Rating.belongsTo(User, {
  foreignKey: "targetId",
  as: "target",
  constraints: false,
});
Rating.belongsTo(User, {
  foreignKey: "raterId",
  as: "rater",
  constraints: false,
});

export default Rating;

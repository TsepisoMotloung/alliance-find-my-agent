
import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export interface IQuestion {
  id: string;
  targetRole: "agent" | "employee";
  question: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface QuestionCreationAttributes
  extends Optional<IQuestion, "id" | "createdAt" | "updatedAt" | "isActive" | "order"> {}

class Question extends Model<IQuestion, QuestionCreationAttributes> implements IQuestion {
  public id!: string;
  public targetRole!: "agent" | "employee";
  public question!: string;
  public isActive!: boolean;
  public order!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static async getActiveQuestions(targetRole: "agent" | "employee"): Promise<Question[]> {
    return this.findAll({
      where: {
        targetRole,
        isActive: true
      },
      order: [['order', 'ASC']]
    });
  }
}

Question.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    targetRole: {
      type: DataTypes.ENUM("agent", "employee"),
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    modelName: "Question",
    tableName: "questions",
  }
);

export default Question;

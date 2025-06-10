
import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import Rating from "./rating";
import Question from "./question";

// Interface for QuestionRating
interface IQuestionRating {
  id: string;
  ratingId: string;
  questionId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for QuestionRating creation attributes
interface QuestionRatingCreationAttributes
  extends Optional<IQuestionRating, "id" | "createdAt" | "updatedAt"> {}

// QuestionRating model
class QuestionRating
  extends Model<IQuestionRating, QuestionRatingCreationAttributes>
  implements IQuestionRating
{
  public id!: string;
  public ratingId!: string;
  public questionId!: string;
  public score!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public question?: Question;
}

QuestionRating.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    ratingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "ratings",
        key: "id",
      },
    },
    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "questions",
        key: "id",
      },
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
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
    modelName: "QuestionRating",
    tableName: "question_ratings",
  },
);

export default QuestionRating;

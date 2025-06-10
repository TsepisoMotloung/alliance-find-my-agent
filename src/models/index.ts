import User from "./user";
import Agent from "./agent";
import Employee from "./employee";
import Rating from "./rating";
import Complaint from "./complaint";
import Callback from "./callback";
import sequelize from "@/lib/db";
import Question from "./question"; // Added import for Question model
import QuestionRating from "./questionRating";

// Define associations
User.hasOne(Agent, { foreignKey: "userId", as: "agent" });
User.hasOne(Employee, { foreignKey: "userId", as: "employee" });

User.hasMany(Rating, {
  foreignKey: "targetId",
  as: "receivedRatings",
  constraints: false,
  scope: { targetRole: "agent" },
});
User.hasMany(Rating, {
  foreignKey: "raterId",
  as: "givenRatings",
  constraints: false,
});

User.hasMany(Complaint, {
  foreignKey: "targetId",
  as: "receivedComplaints",
  constraints: false,
});
User.hasMany(Complaint, {
  foreignKey: "complainantId",
  as: "filedComplaints",
  constraints: false,
});

Agent.belongsTo(User, { foreignKey: "userId", as: "user" });
Agent.hasMany(Callback, { foreignKey: "agentId", as: "callbacks" });

Employee.belongsTo(User, { foreignKey: "userId", as: "user" });

// Rating and QuestionRating associations
Rating.hasMany(QuestionRating, { foreignKey: "ratingId", as: "questionRatings" });
QuestionRating.belongsTo(Rating, { foreignKey: "ratingId", as: "rating" });

// Question and QuestionRating associations
Question.hasMany(QuestionRating, { foreignKey: "questionId", as: "questionRatings" });
QuestionRating.belongsTo(Question, { foreignKey: "questionId", as: "question" });

// Rating-User associations
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

// Export models and sequelize
export { sequelize, User, Agent, Employee, Rating, Complaint, Callback, Question, QuestionRating };

export default {
  sequelize,
  User,
  Agent,
  Employee,
  Rating,
  Complaint,
  Callback,
  Question,
  QuestionRating,
};
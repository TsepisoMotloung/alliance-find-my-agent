import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";
import { IUser, UserRole, ApprovalStatus } from "@/types/models";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Interface for User creation attributes
interface UserCreationAttributes
  extends Optional<
    IUser,
    "id" | "createdAt" | "updatedAt" | "approvalStatus" | "isActive"
  > {}

// User model
class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public firstName!: string;
  public lastName!: string;
  public phone?: string;
  public profileImage?: string;
  public approvalStatus!: ApprovalStatus;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Hash password before saving
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // Validate password
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Get full name
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approvalStatus: {
      type: DataTypes.ENUM(...Object.values(ApprovalStatus)),
      allowNull: false,
      defaultValue: ApprovalStatus.PENDING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: "User",
    tableName: "users",
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await User.hashPassword(user.password);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          user.password = await User.hashPassword(user.password);
        }
      },
      beforeDestroy: async (user: User) => {
        // Import models dynamically to avoid circular dependencies
        const { Agent, Employee, Rating, Complaint, Callback } = require('./index');
        
        // Delete related agent profile
        await Agent.destroy({ where: { userId: user.id } });
        
        // Delete related employee profile
        await Employee.destroy({ where: { userId: user.id } });
        
        // Delete ratings where user is target or rater
        await Rating.destroy({ where: { targetId: user.id } });
        await Rating.destroy({ where: { raterId: user.id } });
        
        // Delete complaints where user is target or complainant
        await Complaint.destroy({ where: { targetId: user.id } });
        await Complaint.destroy({ where: { complainantId: user.id } });
        
        // Delete callbacks for agents
        const agent = await Agent.findOne({ where: { userId: user.id } });
        if (agent) {
          await Callback.destroy({ where: { agentId: agent.id } });
        }
      },
    },
  },
);

export default User;

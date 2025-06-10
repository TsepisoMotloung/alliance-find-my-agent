import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { User, Agent, Employee } from "@/models";
import { UserRole, ApprovalStatus } from "@/types/models";
import sequelize from "@/lib/db";

// Get a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Allow admins or the user themselves to access
    if (session.user.role !== UserRole.ADMIN && session.user.id !== id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find user with their profile
    const user = await User.findByPk(id, {
      include: [
        {
          model: Agent,
          as: "agent",
          required: false,
        },
        {
          model: Employee,
          as: "employee",
          required: false,
        },
      ],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching user" },
      { status: 500 },
    );
  }
}

// Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Allow admins or the user themselves to update
    if (session.user.role !== UserRole.ADMIN && session.user.id !== id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find user
    const user = await User.findByPk(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Extract updateable fields
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      approvalStatus,
      isActive,
      // Agent fields
      licenseNumber,
      specialization,
      isAvailable,
      // Employee fields
      employeeId,
      department,
      position,
    } = body;

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Prepare user updates
      const userUpdates: any = {};

      if (firstName !== undefined) userUpdates.firstName = firstName;
      if (lastName !== undefined) userUpdates.lastName = lastName;
      if (email !== undefined) userUpdates.email = email;
      if (phone !== undefined) userUpdates.phone = phone;
      if (password !== undefined) userUpdates.password = password;

      // Only admin can update approval status and active status
      if (session.user.role === UserRole.ADMIN) {
        if (approvalStatus !== undefined) userUpdates.approvalStatus = approvalStatus;
        if (typeof isActive === "boolean") userUpdates.isActive = isActive;
      }

      // Update user
      if (Object.keys(userUpdates).length > 0) {
        await user.update(userUpdates, { transaction });
      }

      // Update agent profile if exists
      if (user.role === UserRole.AGENT) {
        const agent = await Agent.findOne({
          where: { userId: id },
          transaction,
        });

        if (agent) {
          const agentUpdates: any = {};

          if (licenseNumber !== undefined) agentUpdates.licenseNumber = licenseNumber;
          if (specialization !== undefined)
            agentUpdates.specialization = specialization;
          if (typeof isAvailable === "boolean")
            agentUpdates.isAvailable = isAvailable;

          if (Object.keys(agentUpdates).length > 0) {
            await agent.update(agentUpdates, { transaction });
          }
        }
      }

      // Update employee profile if exists
      if (user.role === UserRole.EMPLOYEE) {
        const employee = await Employee.findOne({
          where: { userId: id },
          transaction,
        });

        if (employee) {
          const employeeUpdates: any = {};

          if (employeeId !== undefined) employeeUpdates.employeeId = employeeId;
          if (department !== undefined) employeeUpdates.department = department;
          if (position !== undefined) employeeUpdates.position = position;

          if (Object.keys(employeeUpdates).length > 0) {
            await employee.update(employeeUpdates, { transaction });
          }
        }
      }

      // Commit transaction
      await transaction.commit();

      // Fetch updated user with profile
      const updatedUser = await User.findByPk(id, {
        include: [
          {
            model: Agent,
            as: "agent",
            required: false,
          },
          {
            model: Employee,
            as: "employee",
            required: false,
          },
        ],
        attributes: { exclude: ["password"] },
      });

      return NextResponse.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "An error occurred while updating user" },
      { status: 500 },
    );
  }
}

// Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Allow admins or the user themselves to update
    if (session.user.role !== UserRole.ADMIN && session.user.id !== id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find user
    const user = await User.findByPk(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Extract updateable fields
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      approvalStatus,
      isActive,
      // Agent fields
      licenseNumber,
      specialization,
      isAvailable,
      // Employee fields
      employeeId,
      department,
      position,
    } = body;

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Prepare user updates
      const userUpdates: any = {};

      if (firstName) userUpdates.firstName = firstName;
      if (lastName) userUpdates.lastName = lastName;
      if (email) userUpdates.email = email;
      if (phone) userUpdates.phone = phone;
      if (password) userUpdates.password = password;

      // Only admin can update approval status and active status
      if (session.user.role === UserRole.ADMIN) {
        if (approvalStatus) userUpdates.approvalStatus = approvalStatus;
        if (typeof isActive === "boolean") userUpdates.isActive = isActive;
      }

      // Update user
      if (Object.keys(userUpdates).length > 0) {
        await user.update(userUpdates, { transaction });
      }

      // Update agent profile if exists
      if (user.role === UserRole.AGENT) {
        const agent = await Agent.findOne({
          where: { userId: id },
          transaction,
        });

        if (agent) {
          const agentUpdates: any = {};

          if (licenseNumber) agentUpdates.licenseNumber = licenseNumber;
          if (specialization !== undefined)
            agentUpdates.specialization = specialization;
          if (typeof isAvailable === "boolean")
            agentUpdates.isAvailable = isAvailable;

          if (Object.keys(agentUpdates).length > 0) {
            await agent.update(agentUpdates, { transaction });
          }
        }
      }

      // Update employee profile if exists
      if (user.role === UserRole.EMPLOYEE) {
        const employee = await Employee.findOne({
          where: { userId: id },
          transaction,
        });

        if (employee) {
          const employeeUpdates: any = {};

          if (employeeId) employeeUpdates.employeeId = employeeId;
          if (department) employeeUpdates.department = department;
          if (position) employeeUpdates.position = position;

          if (Object.keys(employeeUpdates).length > 0) {
            await employee.update(employeeUpdates, { transaction });
          }
        }
      }

      // Commit transaction
      await transaction.commit();

      // Fetch updated user with profile
      const updatedUser = await User.findByPk(id, {
        include: [
          {
            model: Agent,
            as: "agent",
            required: false,
          },
          {
            model: Employee,
            as: "employee",
            required: false,
          },
        ],
        attributes: { exclude: ["password"] },
      });

      return NextResponse.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "An error occurred while updating user" },
      { status: 500 },
    );
  }
}

// Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only admin can delete users
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find user
    const user = await User.findByPk(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete user (cascade will delete related profiles)
    await user.destroy();

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting user" },
      { status: 500 },
    );
  }
}
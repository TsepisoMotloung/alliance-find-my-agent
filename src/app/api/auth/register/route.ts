import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { User, Agent, Employee } from "@/models";
import { UserRole, ApprovalStatus } from "@/types/models";
import sequelize from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract user data
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      // Agent specific fields
      licenseNumber,
      specialization,
      // Employee specific fields
      employeeId,
      department,
      position,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate role
    if (![UserRole.AGENT, UserRole.EMPLOYEE, UserRole.USER].includes(role)) {
      return NextResponse.json(
        { message: "Invalid user role" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 400 },
      );
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Create user with pending approval status
      const userId = uuidv4();
      const user = await User.create(
        {
          id: userId,
          firstName,
          lastName,
          email,
          password,
          phone,
          role,
          approvalStatus:
            role === UserRole.USER
              ? ApprovalStatus.APPROVED
              : ApprovalStatus.PENDING,
          isActive: true,
        },
        { transaction },
      );

      // Create additional profile based on role
      if (role === UserRole.AGENT) {
        // Validate agent-specific fields
        if (!licenseNumber) {
          await transaction.rollback();
          return NextResponse.json(
            { message: "License number is required for agents" },
            { status: 400 },
          );
        }

        // Check if license number already exists
        const existingAgent = await Agent.findOne({
          where: { licenseNumber },
          transaction,
        });

        if (existingAgent) {
          await transaction.rollback();
          return NextResponse.json(
            { message: "License number already registered" },
            { status: 400 },
          );
        }

        // Create agent profile
        await Agent.create(
          {
            id: uuidv4(),
            userId,
            licenseNumber,
            specialization,
            isAvailable: true,
          },
          { transaction },
        );
      } else if (role === UserRole.EMPLOYEE) {
        // Validate employee-specific fields
        if (!employeeId || !department || !position) {
          await transaction.rollback();
          return NextResponse.json(
            {
              message:
                "Employee ID, department, and position are required for employees",
            },
            { status: 400 },
          );
        }

        // Check if employee ID already exists
        const existingEmployee = await Employee.findOne({
          where: { employeeId },
          transaction,
        });

        if (existingEmployee) {
          await transaction.rollback();
          return NextResponse.json(
            { message: "Employee ID already registered" },
            { status: 400 },
          );
        }

        // Create employee profile
        await Employee.create(
          {
            id: uuidv4(),
            userId,
            employeeId,
            department,
            position,
          },
          { transaction },
        );
      }

      // Commit transaction
      await transaction.commit();

      // Return success response (exclude password)
      const { password: _, ...userWithoutPassword } = user.toJSON();

      return NextResponse.json(
        {
          message: "Registration successful",
          user: userWithoutPassword,
        },
        { status: 200 },
      );
    } catch (error) {
      // Rollback transaction on error
      console.log("Here is the error:", error);
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 },
    );
  }
}

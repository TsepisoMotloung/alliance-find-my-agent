
import { NextRequest, NextResponse } from "next/server";
import { Question } from "@/models";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetRole = searchParams.get("targetRole");

    if (!targetRole || (targetRole !== "agent" && targetRole !== "employee")) {
      return NextResponse.json(
        { error: "Valid targetRole (agent or employee) is required" },
        { status: 400 }
      );
    }

    const questions = await Question.getActiveQuestions(targetRole as "agent" | "employee");

    return NextResponse.json({
      success: true,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        order: q.order
      }))
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetRole, question, order, isActive = true } = body;

    if (!targetRole || !question) {
      return NextResponse.json(
        { error: "targetRole and question are required" },
        { status: 400 }
      );
    }

    if (targetRole !== "agent" && targetRole !== "employee") {
      return NextResponse.json(
        { error: "targetRole must be 'agent' or 'employee'" },
        { status: 400 }
      );
    }

    const newQuestion = await Question.create({
      targetRole,
      question,
      order: order || 0,
      isActive
    });

    return NextResponse.json({
      success: true,
      question: newQuestion
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}

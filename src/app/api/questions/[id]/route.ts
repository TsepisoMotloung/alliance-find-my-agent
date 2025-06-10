
import { NextRequest, NextResponse } from "next/server";
import { Question } from "@/models";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { question, order, isActive } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const existingQuestion = await Question.findByPk(resolvedParams.id);

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    await existingQuestion.update({
      question,
      order: order !== undefined ? order : existingQuestion.order,
      isActive: isActive !== undefined ? isActive : existingQuestion.isActive,
    });

    return NextResponse.json({
      success: true,
      question: existingQuestion
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const question = await Question.findByPk(resolvedParams.id);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    await question.destroy();

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}

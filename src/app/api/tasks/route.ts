import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, priority, dueDate, tags } =
      await request.json();

    // Create or connect tags
    const tagConnections =
      tags?.map((tagName: string) => ({
        where: { name: tagName },
        create: { name: tagName },
      })) || [];

    const task = await prisma.task.create({
      data: {
        title: title || "Untitled Task",
        description: description || "",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: {
          connectOrCreate: tagConnections,
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

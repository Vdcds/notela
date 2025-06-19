import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get database stats
    const [noteCount, taskCount, tagCount] = await Promise.all([
      prisma.note.count(),
      prisma.task.count(),
      prisma.tag.count(),
    ]);

    const completedTasks = await prisma.task.count({
      where: { completed: true },
    });

    const pendingTasks = taskCount - completedTasks;

    return NextResponse.json({
      database: "SQLite",
      orm: "Prisma",
      status: "connected",
      stats: {
        notes: noteCount,
        tasks: {
          total: taskCount,
          completed: completedTasks,
          pending: pendingTasks,
        },
        tags: tagCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        database: "SQLite",
        orm: "Prisma",
        status: "error",
        error: "Failed to connect to database",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

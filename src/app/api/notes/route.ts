import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      include: {
        tags: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, filename, tags } = await request.json();

    // Create or connect tags
    const tagConnections =
      tags?.map((tagName: string) => ({
        where: { name: tagName },
        create: { name: tagName },
      })) || [];

    const note = await prisma.note.create({
      data: {
        title: title || "Untitled Note",
        content: content || "",
        filename: filename,
        tags: {
          connectOrCreate: tagConnections,
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

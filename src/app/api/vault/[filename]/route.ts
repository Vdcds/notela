import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Check password in header
    const password = request.headers.get("x-vault-password");
    if (password !== "5204") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await params;
    
    // Find note by filename
    const note = await prisma.note.findFirst({
      where: {
        filename: filename,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ content: note.content, filename });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Check password in header
    const password = request.headers.get("x-vault-password");
    if (password !== "5204") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Find and update note by filename
    const note = await prisma.note.findFirst({
      where: {
        filename: filename,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Extract title from first line or use existing title
    const firstLine = content.split("\n")[0];
    const title = firstLine.startsWith("#")
      ? firstLine.replace(/^#+\s*/, "").trim()
      : note.title;

    const updatedNote = await prisma.note.update({
      where: {
        id: note.id,
      },
      data: {
        content: content,
        title: title,
      },
    });

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Check password in header
    const password = request.headers.get("x-vault-password");
    if (password !== "5204") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await params;

    // Find and delete note by filename
    const note = await prisma.note.findFirst({
      where: {
        filename: filename,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await prisma.note.delete({
      where: {
        id: note.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

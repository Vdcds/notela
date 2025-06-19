import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check password in header
    const password = request.headers.get("x-vault-password");
    if (password !== "5204") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get notes from database instead of file system
    const notes = await prisma.note.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        tags: true,
      },
    });

    // Transform database notes to match vault file interface
    const files = notes.map((note) => ({
      filename:
        note.filename ||
        `${note.title
          .replace(/[^a-zA-Z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .toLowerCase()}.md`,
      title: note.title,
      lastModified: note.updatedAt.toISOString(),
      size: note.content.length,
      preview:
        note.content.substring(0, 200) +
        (note.content.length > 200 ? "..." : ""),
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error reading vault:", error);
    return NextResponse.json(
      { error: "Failed to read vault" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check password in header
    const password = request.headers.get("x-vault-password");
    if (password !== "5204") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, filename } = await request.json();

    if (!content || !filename) {
      return NextResponse.json(
        { error: "Content and filename are required" },
        { status: 400 }
      );
    }

    // Extract title from first line or use filename
    const firstLine = content.split("\n")[0];
    const title = firstLine.startsWith("#")
      ? firstLine.replace(/^#+\s*/, "").trim()
      : filename.replace(".md", ""); // Create or update note in database
    // First try to find existing note by filename
    const existingNote = await prisma.note.findFirst({
      where: {
        filename: filename,
      },
    });

    let note;
    if (existingNote) {
      // Update existing note
      note = await prisma.note.update({
        where: {
          id: existingNote.id,
        },
        data: {
          content: content,
          title: title,
        },
      });
    } else {
      // Create new note
      note = await prisma.note.create({
        data: {
          title: title,
          content: content,
          filename: filename,
        },
      });
    }

    return NextResponse.json({ success: true, filename, id: note.id });
  } catch (error) {
    console.error("Error saving to vault:", error);
    return NextResponse.json(
      { error: "Failed to save to vault" },
      { status: 500 }
    );
  }
}

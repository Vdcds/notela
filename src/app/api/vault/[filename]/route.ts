import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VAULT_DIR = path.join(process.cwd(), "vault");

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Check password in header
    const password = request.headers.get("x-vault-password");
    if (password !== "5204") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filename = params.filename;
    const filePath = path.join(VAULT_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ content, filename });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Check password in header
    const password = request.headers.get("x-vault-password");
    if (password !== "5204") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filename = await params.filename;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const filePath = path.join(VAULT_DIR, filename);
    fs.writeFileSync(filePath, content, "utf-8");

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
  { params }: { params: { filename: string } }
) {
  try {
    // Check password in header
    const password = request.headers.get("x-vault-password");
    if (password !== "5204") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filename = params.filename;
    const filePath = path.join(VAULT_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

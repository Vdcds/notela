import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VAULT_DIR = path.join(process.cwd(), "vault");

// Ensure vault directory exists
if (!fs.existsSync(VAULT_DIR)) {
  fs.mkdirSync(VAULT_DIR, { recursive: true });
}

export async function GET(request: NextRequest) {
  try {
    // Check password in header
    const password = request.headers.get("x-vault-password");
    if (password !== "5204") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const files = fs
      .readdirSync(VAULT_DIR)
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const filePath = path.join(VAULT_DIR, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, "utf-8");

        // Extract title from first line or filename
        const firstLine = content.split("\n")[0];
        const title = firstLine.startsWith("#")
          ? firstLine.replace(/^#+\s*/, "").trim()
          : file.replace(".md", "");

        return {
          filename: file,
          title: title || file.replace(".md", ""),
          lastModified: stats.mtime.toISOString(),
          size: stats.size,
          preview:
            content.substring(0, 200) + (content.length > 200 ? "..." : ""),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime()
      );

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

    const filePath = path.join(VAULT_DIR, filename);
    fs.writeFileSync(filePath, content, "utf-8");

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error("Error saving to vault:", error);
    return NextResponse.json(
      { error: "Failed to save to vault" },
      { status: 500 }
    );
  }
}

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrateVaultFiles() {
  try {
    const vaultDir = path.join(process.cwd(), "vault");

    if (!fs.existsSync(vaultDir)) {
      console.log("Vault directory does not exist");
      return;
    }

    const files = fs
      .readdirSync(vaultDir)
      .filter((file) => file.endsWith(".md"));

    console.log(`Found ${files.length} vault files to migrate`);

    for (const filename of files) {
      const filePath = path.join(vaultDir, filename);
      const content = fs.readFileSync(filePath, "utf-8");

      // Extract title from first line or filename
      const firstLine = content.split("\n")[0];
      const title = firstLine.startsWith("#")
        ? firstLine.replace(/^#+\s*/, "").trim()
        : filename.replace(".md", "");

      // Check if note already exists
      const existingNote = await prisma.note.findFirst({
        where: {
          filename: filename,
        },
      });

      if (existingNote) {
        console.log(`Skipping ${filename} - already exists in database`);
        continue;
      }

      // Create new note
      await prisma.note.create({
        data: {
          title: title || filename.replace(".md", ""),
          content: content,
          filename: filename,
        },
      });

      console.log(`Migrated ${filename} -> ${title}`);
    }

    console.log("Migration completed!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateVaultFiles();

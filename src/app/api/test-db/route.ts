import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection
    const { prisma } = await import('@/lib/prisma');
    
    const files = await prisma.vaultFile.findMany({
      orderBy: { lastModified: 'desc' }
    });

    return NextResponse.json({ 
      status: 'success',
      count: files.length,
      files: files.map(file => ({
        filename: file.filename,
        title: file.title,
        lastModified: file.lastModified.toISOString(),
        size: file.content.length,
        preview: file.content.substring(0, 100)
      }))
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

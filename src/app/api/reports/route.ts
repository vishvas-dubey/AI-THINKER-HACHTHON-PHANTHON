import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reportsDir = path.join(process.cwd(), 'reports');
    
    // Ensure directory exists
    try {
      await fs.access(reportsDir);
    } catch {
      return NextResponse.json({ reports: [] });
    }

    const files = await fs.readdir(reportsDir);
    const reports = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const content = await fs.readFile(path.join(reportsDir, file), 'utf-8');
          return JSON.parse(content);
        })
    );

    // Sort by timestamp descending
    reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Failed to list reports:", error);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}

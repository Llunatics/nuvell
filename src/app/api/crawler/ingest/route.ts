import { NextResponse } from 'next/server';
import { dataService } from '@/server/db/data-service';

export async function POST() {
  const result = dataService.runComprehensiveIngestion();
  return NextResponse.json({
    success: true,
    message: 'Ingestion menyeluruh 254 penerbit resmi via Gramedia.com Unified API berhasil dijalankan.',
    ...result,
  });
}

export async function GET() {
  const sources = dataService.getAllSources();
  const logs = dataService.getCrawlLogs();
  return NextResponse.json({
    sourcesCount: sources.length,
    sources,
    latestLog: logs[0] || null,
  });
}

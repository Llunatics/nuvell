import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/server/db/data-service';
import { isServerAdminAuthenticated } from '@/lib/server/admin-auth';

export async function POST(req: NextRequest) {
  const isAuthorized = await isServerAdminAuthenticated(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, error: 'Akses ditolak. Diperlukan sesi atau kunci otorisasi admin.' },
      { status: 401 }
    );
  }

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

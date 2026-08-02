import { LogViewer } from "@/components/admin/log-viewer";
import { fetchGenerationLogs } from "@/lib/admin/fetch-logs";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await fetchGenerationLogs();
  return <LogViewer logs={logs ?? undefined} />;
}

import { SnsTrendManager } from "@/components/admin/sns-trend-manager";
import { fetchAdminSnsTrends } from "@/lib/admin/fetch-sns-trends";

export const dynamic = "force-dynamic";

export default async function AdminSnsTrendsPage() {
  const items = await fetchAdminSnsTrends();
  return (
    <div className="mx-auto max-w-4xl">
      <SnsTrendManager items={items} />
    </div>
  );
}

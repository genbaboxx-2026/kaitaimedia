import { STATUS_LABEL, type AdminStatus } from "@/lib/admin-data";

const STYLES: Record<AdminStatus, string> = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  unpublished: "bg-slate-200 text-slate-600",
  failed: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: AdminStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${STYLES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

import { GenerationConditions } from "@/components/admin/generation-conditions";
import {
  fetchActivePrompts,
  fetchGenerationSettings,
  fetchPendingThemes,
} from "@/lib/admin/fetch-generation";

export const dynamic = "force-dynamic";

export default async function AdminGenerationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab }, prompts, settings, themes] = await Promise.all([
    searchParams,
    fetchActivePrompts(),
    fetchGenerationSettings(),
    fetchPendingThemes(),
  ]);

  const initialTab =
    tab === "settings" || tab === "prompts" || tab === "policy"
      ? tab
      : "policy";

  return (
    <GenerationConditions
      initialTab={initialTab}
      initialPrompts={prompts ?? undefined}
      initialSettings={settings}
      initialThemes={themes ?? undefined}
    />
  );
}

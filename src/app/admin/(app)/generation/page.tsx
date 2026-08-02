import { GenerationConditions } from "@/components/admin/generation-conditions";
import {
  fetchActivePrompts,
  fetchGenerationSettings,
  fetchPendingThemes,
  fetchMasters,
} from "@/lib/admin/fetch-generation";

export const dynamic = "force-dynamic";

export default async function AdminGenerationPage() {
  const [prompts, settings, themes, masters] = await Promise.all([
    fetchActivePrompts(),
    fetchGenerationSettings(),
    fetchPendingThemes(),
    fetchMasters(),
  ]);

  return (
    <GenerationConditions
      initialPrompts={prompts ?? undefined}
      initialSettings={settings}
      initialThemes={themes ?? undefined}
      initialMasters={masters ?? undefined}
    />
  );
}

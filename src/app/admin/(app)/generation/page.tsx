import { GenerationConditions } from "@/components/admin/generation-conditions";
import {
  fetchActivePrompts,
  fetchGenerationSettings,
  fetchPendingThemes,
} from "@/lib/admin/fetch-generation";

export const dynamic = "force-dynamic";

export default async function AdminGenerationPage() {
  const [prompts, settings, themes] = await Promise.all([
    fetchActivePrompts(),
    fetchGenerationSettings(),
    fetchPendingThemes(),
  ]);

  return (
    <GenerationConditions
      initialPrompts={prompts ?? undefined}
      initialSettings={settings}
      initialThemes={themes ?? undefined}
    />
  );
}

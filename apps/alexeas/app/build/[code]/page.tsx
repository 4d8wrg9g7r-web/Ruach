import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Configurator } from "@/components/configurator/configurator";
import { decodeConfig, encodeConfig, summaryRows } from "@/lib/config/engine";
import { getModel } from "@/lib/data/models";

/**
 * Shareable saved-build route. The full instrument is encoded in the URL, so a
 * build can be reopened, refreshed, or sent to a friend with no server state.
 * Unknown codes 404 rather than rendering a broken instrument.
 */

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const config = decodeConfig(code);
  if (!config) return { title: "Saved Build" };
  const model = getModel(config.model);
  const rows = summaryRows(config);
  return {
    title: `${model?.name} — Build ${encodeConfig(config)}`,
    description: rows.map((r) => `${r.label}: ${r.value}`).join(" · "),
    robots: { index: false, follow: true },
  };
}

export default async function SavedBuildPage({ params }: Props) {
  const { code } = await params;
  const config = decodeConfig(code);
  if (!config) notFound();
  return <Configurator initialConfig={config} savedReference={encodeConfig(config)} />;
}

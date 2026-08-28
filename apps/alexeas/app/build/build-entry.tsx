"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Configurator } from "@/components/configurator/configurator";
import { decodeConfig, defaultConfig, encodeConfig } from "@/lib/config/engine";
import { getModel } from "@/lib/data/models";

/**
 * Builder entry. Restores a saved build from `?c=CODE` (fully client-side, so
 * the whole site stays static), otherwise honors a `?model=` hint from
 * "Build This Model" links, otherwise starts from the OM. Wrapped in Suspense by
 * the page because it reads search params.
 */
export function BuildEntry() {
  const params = useSearchParams();
  const code = params.get("c");
  const requested = params.get("model");

  const { config, saved } = useMemo(() => {
    if (code) {
      const decoded = decodeConfig(code);
      if (decoded) return { config: decoded, saved: encodeConfig(decoded) };
    }
    const slug = requested && getModel(requested) ? requested : "om-14";
    return { config: defaultConfig(slug), saved: undefined as string | undefined };
  }, [code, requested]);

  return <Configurator initialConfig={config} savedReference={saved} />;
}

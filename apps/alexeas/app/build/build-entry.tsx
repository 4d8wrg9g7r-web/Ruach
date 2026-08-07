"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Configurator } from "@/components/configurator/configurator";
import { defaultConfig } from "@/lib/config/engine";
import { getModel } from "@/lib/data/models";

/**
 * Builder entry. Honors a `?model=` hint (from "Build This Model" links) by
 * seeding the configuration; otherwise starts from the OM, the versatile
 * all-rounder. Wrapped in Suspense by the page because it reads search params.
 */
export function BuildEntry() {
  const params = useSearchParams();
  const requested = params.get("model");
  const initial = useMemo(() => {
    const slug = requested && getModel(requested) ? requested : "om-14";
    return defaultConfig(slug);
  }, [requested]);

  return <Configurator initialConfig={initial} />;
}

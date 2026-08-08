"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { PricePanel } from "./PricePanel";
import { StepBody, contextualTeach } from "./StepBody";
import { Review } from "./Review";
import { finishById, type FinishCategory } from "@/lib/data/finishes";
import {
  type Build,
  STEPS,
  platformById,
  designationFor,
} from "@/lib/data/configurator";
import { computePrice, formatEUR, isStepComplete, reconcile } from "@/lib/build";

/* ---- share-link encoding ----------------------------------------- */
function encodeBuild(b: Build): string {
  const json = JSON.stringify(b);
  const base64 = typeof window === "undefined" ? Buffer.from(json).toString("base64") : window.btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeBuild(s: string): Build | null {
  try {
    const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(window.atob(base64)));
    return JSON.parse(json) as Build;
  } catch {
    return null;
  }
}

export function Configurator() {
  const [build, setBuild] = useState<Build>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [finishCategory, setFinishCategory] = useState<FinishCategory>("SOLID SATIN");

  // Hydrate from a shared link (?b=...) on mount, client-only (avoids Suspense).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const b = params.get("b");
    if (b) {
      const parsed = decodeBuild(b);
      if (parsed) {
        setBuild(reconcile(parsed));
        setStepIndex(STEPS.length - 1); // jump to review
      }
    }
  }, []);

  const step = STEPS[stepIndex];
  const finish = build.finish ? finishById(build.finish) : undefined;
  const platform = build.platform ? platformById(build.platform) : undefined;
  const tint: [number, number, number] = finish?.tint ?? [138, 143, 152];

  function set(patch: Partial<Build>) {
    setBuild((prev) => reconcile({ ...prev, ...patch }));
  }

  const canNext = isStepComplete(step.id, build);
  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/build?b=${encodeBuild(build)}`;
  }, [build]);

  function next() {
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }
  function prev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  const teach = contextualTeach(step.id, build) ?? step.teach;
  const price = computePrice(build);
  const des = designationFor(build);

  if (step.id === "review") {
    return (
      <div className="shell pb-24 pt-24">
        <StepRail stepIndex={stepIndex} build={build} onJump={setStepIndex} />
        <div className="mt-8">
          <Review build={build} shareLink={shareLink} />
        </div>
        <div className="mt-8">
          <button onClick={prev} className="font-mono text-[12px] uppercase tracking-wide-tech text-steel hover:text-chalk">
            ← Back to configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* progress rail */}
      <div className="shell pt-6">
        <StepRail stepIndex={stepIndex} build={build} onJump={setStepIndex} />
      </div>

      <div className="shell grid gap-8 py-6 lg:grid-cols-[63%_37%] lg:gap-10">
        {/* LEFT — visualizer */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div
            className="instrument-ambient relative flex h-[38vh] items-center justify-center overflow-hidden rounded border border-graphite-line lg:h-[76vh]"
            style={{ ["--instrument-tint" as string]: tint.join(",") }}
          >
            <div className="pointer-events-none absolute inset-0 grid-tech opacity-[0.1]" />
            {des && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="select-none font-display text-[30vw] font-bold leading-none text-chalk/[0.04] lg:text-[18vw]">
                  {des}
                </span>
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${build.platform}-${build.strings}-${build.finish}-${build.hardwareColor}-${build.orientation}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-[112%]"
              >
                {build.platform ? (
                  <GuitarVisual
                    construction={platform?.construction}
                    strings={build.strings ?? platform?.stringCounts[0] ?? 6}
                    orientation={build.orientation}
                    hardwareColor={build.hardwareColor}
                    finish={finish}
                    className="h-full w-auto"
                  />
                ) : (
                  <div className="flex h-full items-center px-8 text-center font-mono text-[12px] uppercase tracking-wide-tech text-steel-dim">
                    Choose a platform to begin
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {des && (
              <div className="absolute bottom-4 left-4 font-mono text-[11px] text-ice">{des}</div>
            )}
          </div>
        </div>

        {/* RIGHT — configuration panel */}
        <div className="flex min-h-[50vh] flex-col">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-mono text-[11px] text-ice">
              {String(step.n).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
            </span>
            <span className="tech-label">{step.label}</span>
          </div>
          <h2 className="font-display text-2xl">{step.label}</h2>
          <p className="mt-1.5 mb-5 max-w-md text-[13px] leading-relaxed text-steel">{teach}</p>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <StepBody
                  step={step.id}
                  build={build}
                  set={set}
                  finishCategory={finishCategory}
                  onFinishCategory={setFinishCategory}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* desktop nav */}
          <div className="mt-8 hidden items-center justify-between border-t border-graphite-line pt-5 lg:flex">
            <button
              onClick={prev}
              disabled={stepIndex === 0}
              className="font-mono text-[12px] uppercase tracking-wide-tech text-steel transition hover:text-chalk disabled:opacity-30"
            >
              ← Back
            </button>
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-wide-tech text-steel-dim">Estimated</div>
              <div className="font-display text-lg tabular-nums">{price > 0 ? formatEUR(price) : "—"}</div>
            </div>
            <button
              onClick={next}
              disabled={!canNext}
              className={clsx(
                "rounded-sm px-6 py-3 font-mono text-[12px] uppercase tracking-wide-tech transition-all duration-ui",
                canNext ? "bg-chalk text-void hover:bg-ice" : "cursor-not-allowed bg-graphite-raised text-steel-dim",
              )}
            >
              {stepIndex === STEPS.length - 2 ? "Review build →" : "Continue →"}
            </button>
          </div>
        </div>
      </div>

      {/* mobile sticky action bar (§33) */}
      <div className="frosted fixed inset-x-0 bottom-0 z-30 border-t border-graphite-line lg:hidden">
        <div className="shell flex items-center justify-between gap-3 py-3">
          <button onClick={prev} disabled={stepIndex === 0} className="font-mono text-[11px] uppercase tracking-wide-tech text-steel disabled:opacity-30">
            ← Back
          </button>
          <div className="text-center">
            <div className="font-mono text-[9px] uppercase tracking-wide-tech text-steel-dim">{des ?? "Build"}</div>
            <div className="font-display text-base tabular-nums leading-none">{price > 0 ? formatEUR(price) : "—"}</div>
          </div>
          <button
            onClick={next}
            disabled={!canNext}
            className={clsx(
              "rounded-sm px-5 py-2.5 font-mono text-[11px] uppercase tracking-wide-tech",
              canNext ? "bg-chalk text-void" : "bg-graphite-raised text-steel-dim",
            )}
          >
            {stepIndex === STEPS.length - 2 ? "Review" : "Next"}
          </button>
        </div>
      </div>
      {/* spacer so content clears the mobile bar */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}

/* ---- step rail --------------------------------------------------- */
function StepRail({
  stepIndex,
  build,
  onJump,
}: {
  stepIndex: number;
  build: Build;
  onJump: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const done = isStepComplete(s.id, build) && i < stepIndex;
        const active = i === stepIndex;
        // only allow jumping to steps up to the furthest completed + 1
        const reachable = i <= stepIndex || isStepComplete(STEPS[Math.max(0, i - 1)].id, build);
        return (
          <button
            key={s.id}
            onClick={() => reachable && onJump(i)}
            disabled={!reachable}
            className={clsx(
              "group flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-wide-tech transition",
              active ? "text-chalk" : done ? "text-steel" : "text-steel-dim",
              reachable ? "hover:text-chalk" : "cursor-not-allowed",
            )}
          >
            <span
              className={clsx(
                "flex h-4 w-4 items-center justify-center rounded-full border text-[8px]",
                active ? "border-ice bg-ice text-void" : done ? "border-steel text-steel" : "border-graphite-line",
              )}
            >
              {done ? "✓" : s.n}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

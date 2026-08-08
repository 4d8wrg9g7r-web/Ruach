"use client";

import { OptionCard } from "./OptionCard";
import { FinishSwatch } from "@/components/ui/FinishSwatch";
import {
  FINISH_CATEGORIES,
  finishesByCategory,
  finishById,
  type FinishCategory,
} from "@/lib/data/finishes";
import {
  type Build,
  type StepId,
  PLATFORMS,
  platformById,
  ORIENTATIONS,
  BRIDGES,
  FRETBOARDS,
  INLAY_STYLES,
  INLAY_MATERIALS,
  SIDE_DOTS,
  HARDWARE_COLORS,
  PICKUP_SETS,
  CONTROLS,
  stringCountsFor,
  bridgesFor,
  pickupLayoutsFor,
  scaleFor,
} from "@/lib/data/configurator";

type SetFn = (patch: Partial<Build>) => void;

export function StepBody({
  step,
  build,
  set,
  finishCategory,
  onFinishCategory,
}: {
  step: StepId;
  build: Build;
  set: SetFn;
  finishCategory: FinishCategory;
  onFinishCategory: (c: FinishCategory) => void;
}) {
  switch (step) {
    case "platform":
      return (
        <Grid>
          {PLATFORMS.map((p) => (
            <OptionCard
              key={p.id}
              title={p.name}
              desc={`${p.stringCounts.join("/")}-string · ${p.construction}`}
              selected={build.platform === p.id}
              onSelect={() => set({ platform: p.id })}
            />
          ))}
        </Grid>
      );

    case "strings": {
      const counts = stringCountsFor(build);
      if (!counts.length) return <Empty>Choose a platform first.</Empty>;
      return (
        <Grid cols={3}>
          {counts.map((n) => {
            const scale = platformById(build.platform!)?.scaleByStrings[n];
            return (
              <OptionCard
                key={n}
                title={`${n} strings`}
                desc={scale ? `Scale ${scale}` : undefined}
                selected={build.strings === n}
                onSelect={() => set({ strings: n })}
              />
            );
          })}
        </Grid>
      );
    }

    case "format": {
      const platform = build.platform ? platformById(build.platform) : undefined;
      return (
        <Grid cols={2}>
          {(["right", "left"] as const).map((o) => {
            const allowed = platform?.orientations.includes(o) ?? o === "right";
            return (
              <OptionCard
                key={o}
                title={ORIENTATIONS[o].label}
                desc={ORIENTATIONS[o].desc}
                priceAdd={ORIENTATIONS[o].priceAdd}
                selected={build.orientation === o}
                disabled={!allowed}
                disabledReason={`Left-handed isn't offered on the ${platform?.name ?? "selected"} platform.`}
                onSelect={() => set({ orientation: o })}
              />
            );
          })}
        </Grid>
      );
    }

    case "finish": {
      const options = finishesByCategory(finishCategory);
      const selected = build.finish ? finishById(build.finish) : undefined;
      return (
        <div>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {FINISH_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => onFinishCategory(c)}
                className={
                  "rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide-tech transition-all duration-ui " +
                  (finishCategory === c
                    ? "border-ice bg-ice/10 text-chalk"
                    : "border-graphite-line text-steel hover:text-chalk")
                }
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {options.map((f) => (
              <FinishSwatch
                key={f.id}
                finish={f}
                size="sm"
                selected={build.finish === f.id}
                onSelect={() => set({ finish: f.id })}
              />
            ))}
          </div>
          {selected?.id === "custom" && (
            <div className="mt-5">
              <label className="tech-label mb-2 block" htmlFor="customfinish">
                Describe your finish — custom from €750
              </label>
              <textarea
                id="customfinish"
                rows={3}
                value={build.customFinishNote ?? ""}
                onChange={(e) => set({ customFinishNote: e.target.value })}
                placeholder="e.g. Deep Sky Blue to Blood Wine Copper Pearl fade, matte, with a subtle flake…"
                className="w-full rounded-sm border border-graphite-line bg-graphite-raised/50 p-3 text-sm text-chalk outline-none placeholder:text-steel-dim focus:border-ice"
              />
            </div>
          )}
        </div>
      );
    }

    case "fretboard":
      return (
        <div className="space-y-6">
          <SubSection title="Board material">
            <Grid cols={2}>
              {FRETBOARDS.map((o) => (
                <OptionCard key={o.id} title={o.label} desc={o.desc} chip={o.chip} selected={build.fretboard === o.id} onSelect={() => set({ fretboard: o.id })} />
              ))}
            </Grid>
          </SubSection>
          <SubSection title="Inlay style">
            <Grid cols={3}>
              {INLAY_STYLES.map((o) => (
                <OptionCard key={o.id} title={o.label} desc={o.desc} selected={build.inlayStyle === o.id} onSelect={() => set({ inlayStyle: o.id })} size="sm" />
              ))}
            </Grid>
          </SubSection>
          {build.inlayStyle && build.inlayStyle !== "none" && (
            <SubSection title="Inlay material">
              <Grid cols={2}>
                {INLAY_MATERIALS.map((o) => (
                  <OptionCard key={o.id} title={o.label} priceAdd={o.priceAdd} selected={build.inlayMaterial === o.id} onSelect={() => set({ inlayMaterial: o.id })} size="sm" />
                ))}
              </Grid>
            </SubSection>
          )}
          <SubSection title="Side dots">
            <Grid cols={2}>
              {SIDE_DOTS.map((o) => (
                <OptionCard key={o.id} title={o.label} chip={o.chip} selected={build.sideDots === o.id} onSelect={() => set({ sideDots: o.id })} size="sm" />
              ))}
            </Grid>
          </SubSection>
        </div>
      );

    case "hardware":
      return (
        <Grid cols={2}>
          {HARDWARE_COLORS.map((o) => (
            <OptionCard key={o.id} title={o.label} priceAdd={o.priceAdd} chip={o.chip} selected={build.hardwareColor === o.id} onSelect={() => set({ hardwareColor: o.id })} />
          ))}
        </Grid>
      );

    case "bridge": {
      const valid = bridgesFor(build);
      if (!build.platform) return <Empty>Choose a platform first.</Empty>;
      const validIds = new Set(valid.map((b) => b.id));
      // Show valid bridges; also surface a couple of common ones as disabled with a reason.
      const shown = BRIDGES.filter(
        (b) => validIds.has(b.id) || ["floyd-rose", "evertune"].includes(b.id),
      );
      return (
        <Grid>
          {shown.map((b) => {
            const ok = validIds.has(b.id);
            return (
              <OptionCard
                key={b.id}
                title={b.label}
                desc={b.desc}
                priceAdd={b.priceAdd}
                selected={build.bridge === b.id}
                disabled={!ok}
                disabledReason={`Unavailable on the ${platformById(build.platform!)?.name} configuration.`}
                onSelect={() => set({ bridge: b.id })}
              />
            );
          })}
        </Grid>
      );
    }

    case "pickups": {
      const layouts = pickupLayoutsFor(build);
      return (
        <div className="space-y-6">
          <SubSection title="Layout">
            <Grid cols={2}>
              {layouts.map((l) => (
                <OptionCard key={l.id} title={l.label} desc={l.desc} selected={build.pickupLayout === l.id} onSelect={() => set({ pickupLayout: l.id })} size="sm" />
              ))}
            </Grid>
          </SubSection>
          <SubSection title="Pickup set">
            <Grid cols={2}>
              {PICKUP_SETS.map((p) => (
                <OptionCard
                  key={p.id}
                  title={p.label}
                  desc={`${p.type === "active" ? "Active" : "Passive"} · ${p.character}`}
                  priceAdd={p.priceAdd}
                  selected={build.pickupSet === p.id}
                  onSelect={() => set({ pickupSet: p.id })}
                  size="sm"
                />
              ))}
            </Grid>
          </SubSection>
        </div>
      );
    }

    case "controls":
      return (
        <Grid cols={2}>
          {CONTROLS.map((o) => (
            <OptionCard key={o.id} title={o.label} desc={o.desc} priceAdd={o.priceAdd} selected={build.controls === o.id} onSelect={() => set({ controls: o.id })} />
          ))}
        </Grid>
      );

    case "details":
      return (
        <div className="space-y-4">
          <Field label="Desired tuning" placeholder="e.g. Drop A, standard, F#-standard">
            <input
              value={build.tuning ?? ""}
              onChange={(e) => set({ tuning: e.target.value })}
              className={inputCls}
              placeholder="e.g. Drop A, standard, F#-standard"
            />
          </Field>
          <Field label="String gauge">
            <input
              value={build.gauge ?? ""}
              onChange={(e) => set({ gauge: e.target.value })}
              className={inputCls}
              placeholder="e.g. 10–52, or a custom set"
            />
          </Field>
          <Field label="Special requests">
            <textarea
              rows={4}
              value={build.notes ?? ""}
              onChange={(e) => set({ notes: e.target.value })}
              className={inputCls}
              placeholder="Anything Aristides should know about this build…"
            />
          </Field>
        </div>
      );

    default:
      return null;
  }
}

/* ---- small local layout helpers ---------------------------------- */

const inputCls =
  "w-full rounded-sm border border-graphite-line bg-graphite-raised/50 p-3 text-sm text-chalk outline-none placeholder:text-steel-dim focus:border-ice";

function Grid({ children, cols }: { children: React.ReactNode; cols?: 2 | 3 }) {
  const c = cols === 3 ? "sm:grid-cols-3" : cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2";
  return <div className={`grid grid-cols-1 gap-3 ${c}`}>{children}</div>;
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="tech-label mb-3">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; placeholder?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="tech-label mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-sm border border-dashed border-graphite-line p-8 text-center text-sm text-steel">{children}</div>;
}

/** Contextual teaching (§40) — surfaced by the shell above the step body. */
export function contextualTeach(step: StepId, build: Build): string | null {
  if (step === "strings" && build.platform) {
    const p = platformById(build.platform);
    if (p?.construction === "multiscale" || p?.multiscaleSuffix)
      return "A longer bass-side scale improves low-string tension and clarity while the treble side keeps a familiar feel.";
  }
  if (step === "format" && build.strings) {
    const s = scaleFor(build);
    if (s) return `Your ${build.strings}-string ${platformById(build.platform!)?.name} runs a ${s} scale.`;
  }
  if (step === "bridge") {
    return "EverTune holds pitch through bends and temperature; a fixed bridge maximises sustain transfer.";
  }
  return null;
}

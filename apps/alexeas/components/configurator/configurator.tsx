"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  type Configuration,
  type SlotId,
  STEP_TITLES,
  SLOTS,
  choicesForSlot,
  reconcile,
  encodeConfig,
  slotApplies,
} from "@/lib/config/engine";
import { getModel, MODELS, type InstrumentFamily } from "@/lib/data/models";
import { InstrumentPreview } from "@/components/visuals/instrument-preview";
import { InstrumentSilhouette } from "@/components/visuals/silhouettes";
import { ChoiceCard } from "./choice-card";
import { BuildSummary } from "./summary";
import { HelpMeChoose } from "./help-me-choose";
import { SubmitForm } from "./submit-form";

const STEP_SLOTS: Record<number, SlotId[]> = {
  2: ["top", "body"],
  3: ["neckProfile", "neckWood", "fretboard"],
  4: ["rosette", "fretInlay", "bodyBinding", "neckBinding", "armBevel"],
};

export function Configurator({
  initialConfig,
  savedReference,
}: {
  initialConfig: Configuration;
  savedReference?: string;
}) {
  const [config, setConfig] = useState<Configuration>(() => reconcile(initialConfig));
  const [step, setStep] = useState(savedReference ? 5 : 1);
  const [helpOpen, setHelpOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [origin, setOrigin] = useState("");

  const model = getModel(config.model)!;
  const shareCode = useMemo(() => encodeConfig(config), [config]);
  const shareUrl = `${origin || "https://alexeasguitars.com"}/build/?c=${shareCode}`;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Keep the address bar in sync so a refresh or copied URL preserves the build.
  // Query-based (?c=) so the whole site can stay statically hosted.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.replaceState(null, "", `/build/?c=${shareCode}`);
  }, [shareCode]);

  const setSlot = (slotId: SlotId, slug: string) =>
    setConfig((c) => reconcile({ ...c, [slotId]: slug }));

  const setModel = (slug: string) =>
    setConfig((c) => reconcile({ ...c, model: slug }));

  const applySuggestion = (next: Configuration) => {
    setConfig(reconcile(next));
    setStep(2);
  };

  return (
    <div className="bg-warmwhite pt-20">
      <HelpMeChoose open={helpOpen} onClose={() => setHelpOpen(false)} onApply={applySuggestion} />

      {/* Progress (sticks just below the fixed site header) */}
      <div className="sticky top-20 z-30 border-y border-brass/20 bg-warmwhite/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-editorial items-center gap-1 overflow-x-auto px-6 py-4 sm:gap-4 sm:px-8 lg:px-12">
          {STEP_TITLES.map((title, i) => {
            const n = i + 1;
            const active = n === step;
            const complete = n < step;
            return (
              <button
                key={title}
                onClick={() => setStep(n)}
                className="group flex shrink-0 items-center gap-2"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full font-sans text-[0.65rem] transition-colors ${
                    active
                      ? "bg-espresso text-ivory"
                      : complete
                        ? "bg-brass/25 text-espresso"
                        : "border border-brass/40 text-ink-muted"
                  }`}
                >
                  {complete ? "✓" : `0${n}`}
                </span>
                <span
                  className={`hidden font-sans text-xs uppercase tracking-wider2 sm:inline ${
                    active ? "text-espresso" : "text-ink-muted group-hover:text-ink-soft"
                  }`}
                >
                  {title}
                </span>
                {n < STEP_TITLES.length && <span className="mx-1 hidden h-px w-4 bg-brass/30 sm:block lg:w-8" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto grid max-w-editorial gap-0 lg:grid-cols-[1.35fr_1fr]">
        {/* Preview */}
        <div className="relative border-b border-brass/15 bg-plaster lg:border-b-0 lg:border-r">
          <div className="lg:sticky lg:top-[8.5rem] lg:h-[calc(100vh-8.5rem)]">
            <div className="flex h-full flex-col items-center justify-center px-6 py-10 lg:py-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={model.slug + config.top + config.body + config.bodyBinding + config.rosette + config.armBevel + config.fretInlay + config.fretboard + config.neckBinding}
                  initial={{ opacity: 0.5, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-sm"
                >
                  <InstrumentPreview config={config} className="h-[52vh] w-full drop-shadow-xl lg:h-[64vh]" />
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 text-center">
                <p className="font-serif text-2xl text-espresso">{model.name}</p>
                <p className="font-serif text-base italic text-wood">{model.tagline}</p>
                <p className="mt-1 font-sans text-[0.7rem] uppercase tracking-wider2 text-ink-muted">
                  {shareCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="px-6 pb-32 pt-10 sm:px-8 lg:pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 1 && <StepInstrument config={config} onModel={setModel} onHelp={() => setHelpOpen(true)} />}
              {step === 2 && <StepSlots step={2} title="Voice" subtitle="The woods that make the sound." config={config} setSlot={setSlot} />}
              {step === 3 && <StepSlots step={3} title="Feel" subtitle="How the instrument sits in your hands." config={config} setSlot={setSlot} />}
              {step === 4 && <StepSlots step={4} title="Details" subtitle="The finishing touches, and the flourishes." config={config} setSlot={setSlot} />}
              {step === 5 && <StepReview config={config} shareUrl={shareUrl} reference={shareCode} />}
            </motion.div>
          </AnimatePresence>

          {/* Step nav */}
          <div className="mt-12 flex items-center justify-between border-t border-brass/20 pt-6">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="font-sans text-xs uppercase tracking-wider2 text-ink-muted transition-colors hover:text-espresso disabled:opacity-30"
            >
              ← Back
            </button>
            {step < 5 ? (
              <button onClick={() => setStep((s) => Math.min(5, s + 1))} className="btn-primary !py-3">
                Continue → {STEP_TITLES[step]}
              </button>
            ) : (
              <span className="font-sans text-xs uppercase tracking-wider2 text-brass">Final step</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile summary bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brass/25 bg-warmwhite/95 p-4 backdrop-blur-md lg:hidden">
        <button
          onClick={() => setSummaryOpen(true)}
          className="btn-primary w-full justify-between"
        >
          <span>View Build</span>
          <span>{model.name}</span>
        </button>
      </div>

      <AnimatePresence>
        {summaryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end bg-espresso/50 lg:hidden"
            onClick={() => setSummaryOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-[80vh] w-full overflow-y-auto bg-warmwhite p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-brass/40" />
              <BuildSummary config={config} detailed />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Step 1: Instrument ─────────────────────────────────────────────────────── */
function StepInstrument({
  config,
  onModel,
  onHelp,
}: {
  config: Configuration;
  onModel: (slug: string) => void;
  onHelp: () => void;
}) {
  const [family, setFamily] = useState<InstrumentFamily>(getModel(config.model)?.family ?? "guitar");
  const families: { key: InstrumentFamily; label: string }[] = [
    { key: "guitar", label: "Guitar" },
    { key: "mandolin", label: "Mandolin" },
    { key: "custom", label: "Other" },
  ];
  const models = MODELS.filter((m) => m.family === family);

  return (
    <div>
      <StepHeader n="01" title="Instrument" subtitle="Every build begins with a body." />

      <button
        onClick={onHelp}
        className="mb-8 flex w-full items-center justify-between border border-sea/40 bg-sea/5 px-5 py-4 text-left transition-colors hover:bg-sea/10"
      >
        <span>
          <span className="font-serif text-lg text-espresso">Not sure where to begin?</span>
          <span className="mt-0.5 block font-sans text-sm text-ink-soft">
            Answer a few questions and we’ll suggest a starting point.
          </span>
        </span>
        <span className="font-sans text-xs uppercase tracking-wider2 text-sea">Help me choose →</span>
      </button>

      <div className="mb-6 flex gap-2">
        {families.map((f) => (
          <button
            key={f.key}
            onClick={() => setFamily(f.key)}
            className={`px-4 py-2 font-sans text-xs uppercase tracking-wider2 transition-colors ${
              family === f.key ? "bg-espresso text-ivory" : "border border-brass/30 text-ink-muted hover:text-espresso"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {family === "custom" ? (
        <div className="border border-brass/25 bg-plaster p-8">
          <h3 className="font-serif text-2xl text-espresso">Something else entirely.</h3>
          <p className="mt-3 font-sans leading-relaxed text-ink-soft">
            Other stringed instruments begin as a conversation rather than a form. Tell us
            what you have in mind and we’ll take it from there.
          </p>
          <Link href="/contact" className="btn-ghost mt-6">Start the conversation →</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {models.map((m) => {
            const selected = m.slug === config.model;
            return (
              <button
                key={m.slug}
                onClick={() => onModel(m.slug)}
                aria-pressed={selected}
                className={`group flex flex-col border p-5 text-left transition-all duration-500 ease-atelier ${
                  selected ? "border-espresso ring-1 ring-espresso" : "border-brass/25 hover:border-brass/60"
                }`}
              >
                <div className="flex justify-center py-2">
                  <InstrumentSilhouette
                    silhouette={m.silhouette}
                    stroke="#3A2A21"
                    strokeWidth={1.2}
                    className="h-40 w-auto text-espresso transition-transform duration-700 ease-atelier group-hover:rotate-[2deg]"
                  />
                </div>
                <p className="mt-2 font-serif text-2xl text-espresso">{m.name}</p>
                <p className="font-serif text-sm italic text-wood">{m.tagline}</p>
                <p className="mt-2 font-sans text-xs text-ink-muted">{m.idealUse.join(" · ")}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Steps 2–4: material/detail slots ───────────────────────────────────────── */
function StepSlots({
  step,
  title,
  subtitle,
  config,
  setSlot,
}: {
  step: number;
  title: string;
  subtitle: string;
  config: Configuration;
  setSlot: (slotId: SlotId, slug: string) => void;
}) {
  const slotIds = STEP_SLOTS[step].filter((id) => {
    const slot = SLOTS.find((s) => s.id === id)!;
    return slotApplies(slot, config.model);
  });

  return (
    <div>
      <StepHeader n={`0${step}`} title={title} subtitle={subtitle} />
      <div className="space-y-12">
        {slotIds.map((slotId) => {
          const slot = SLOTS.find((s) => s.id === slotId)!;
          const choices = choicesForSlot(slotId, config);
          return (
            <div key={slotId}>
              <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-brass/20 pb-2">
                <h3 className="font-serif text-2xl text-espresso">{slot.label}</h3>
                <p className="font-sans text-xs text-ink-muted">{slot.help}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {choices.map((choice) => (
                  <ChoiceCard
                    key={choice.slug}
                    choice={choice}
                    slotId={slotId}
                    selected={config[slotId] === choice.slug}
                    onSelect={(slug) => setSlot(slotId, slug)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 5: Review + submit ────────────────────────────────────────────────── */
function StepReview({
  config,
  shareUrl,
  reference,
}: {
  config: Configuration;
  shareUrl: string;
  reference: string;
}) {
  return (
    <div>
      <StepHeader n="05" title="This is the beginning." subtitle="Review your instrument, then send it to the workshop." />

      <div className="border border-brass/20 bg-plaster p-6 sm:p-8">
        <BuildSummary config={config} detailed />
        <div className="mt-6 border-t border-brass/20 pt-5">
          <p className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">Saved build</p>
          <p className="mt-1 break-all font-sans text-sm text-wood">{shareUrl}</p>
          <p className="mt-1 font-sans text-xs text-ink-muted">
            This link saves your build — return to it, or share it with a friend.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="font-serif text-3xl text-espresso">Submit your build</h3>
        <p className="mt-2 max-w-md font-sans leading-relaxed text-ink-soft">
          Send the full specification to {`the workshop`} along with a little about you. This
          begins a conversation — nothing is ordered, and nothing is final.
        </p>
        <div className="mt-8">
          <SubmitForm config={config} shareUrl={shareUrl} reference={reference} />
        </div>
      </div>
    </div>
  );
}

function StepHeader({ n, title, subtitle }: { n: string; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <span className="font-serif text-xl text-brass">{n}</span>
        <span className="h-px w-8 bg-brass/40" />
      </div>
      <h2 className="mt-3 font-serif text-4xl text-espresso">{title}</h2>
      <p className="mt-2 font-sans text-ink-soft">{subtitle}</p>
    </div>
  );
}

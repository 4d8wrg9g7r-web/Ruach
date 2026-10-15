"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HELP_QUESTIONS, recommend, type HelpAnswers } from "@/lib/config/recommend";
import { getModel } from "@/lib/data/models";
import { getWood } from "@/lib/data/woods";
import type { Configuration } from "@/lib/config/engine";

/**
 * A guided questionnaire for players who don't speak lutherie. It never blocks
 * the configurator — it simply proposes a considered starting point, explains
 * the reasoning, and hands control back. Accepting applies the configuration;
 * everything remains editable afterward.
 */
export function HelpMeChoose({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (config: Configuration) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<HelpAnswers>>({});

  const done = step >= HELP_QUESTIONS.length;
  const result = done ? recommend(answers as HelpAnswers) : null;

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  const choose = (id: string, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setStep((s) => s + 1);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-espresso/60 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Help me choose"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto bg-warmwhite p-8 shadow-2xl sm:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 text-ink-muted transition-colors hover:text-espresso"
            >
              ✕
            </button>

            {!done ? (
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <span className="font-serif text-xl text-brass">
                    0{step + 1}
                  </span>
                  <span className="h-px flex-1 bg-brass/20" />
                  <span className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">
                    {step + 1} / {HELP_QUESTIONS.length}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="font-serif text-3xl text-espresso">
                      {HELP_QUESTIONS[step].title}
                    </h2>
                    <div className="mt-8 grid gap-3">
                      {HELP_QUESTIONS[step].options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => choose(HELP_QUESTIONS[step].id, opt.value)}
                          className="group flex items-center justify-between border border-brass/25 px-5 py-4 text-left font-sans text-ink transition-all duration-300 hover:border-espresso hover:bg-plaster"
                        >
                          <span>{opt.label}</span>
                          <span className="text-brass opacity-0 transition-opacity group-hover:opacity-100">→</span>
                        </button>
                      ))}
                    </div>
                    {step > 0 && (
                      <button
                        onClick={() => setStep((s) => s - 1)}
                        className="mt-6 font-sans text-xs uppercase tracking-wider2 text-ink-muted hover:text-espresso"
                      >
                        ← Back
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              result && <Result result={result} onApply={onApply} onClose={onClose} onReset={reset} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Result({
  result,
  onApply,
  onClose,
  onReset,
}: {
  result: ReturnType<typeof recommend>;
  onApply: (config: Configuration) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const model = getModel(result.modelSlug);
  const top = getWood(result.config.top);
  const body = getWood(result.config.body);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p className="overline">We would start here</p>
      <h2 className="mt-3 font-serif text-4xl text-espresso">{model?.name}</h2>
      <p className="mt-1 font-serif text-xl italic text-wood">{model?.tagline}</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {[`${top?.name} top`, `${body?.name} back & sides`, "Ebony fretboard"].map((s) => (
          <li key={s} className="border border-brass/30 px-3 py-1 font-sans text-xs uppercase tracking-wider2 text-ink-soft">
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 border-t border-brass/20 pt-5">
        <p className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">Why we’d begin here</p>
        {result.reasons.map((r, i) => (
          <p key={i} className="font-sans text-sm leading-relaxed text-ink-soft">— {r}</p>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => {
            onApply(result.config);
            onClose();
          }}
          className="btn-primary"
        >
          Start from here
        </button>
        <button onClick={onReset} className="btn-ghost">
          Answer again
        </button>
      </div>
      <p className="mt-4 font-sans text-xs text-ink-muted">
        A starting point, not a decision. You can change everything from here.
      </p>
    </motion.div>
  );
}

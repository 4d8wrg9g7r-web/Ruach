import { CTAButton } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center pt-16">
      <div className="shell">
        <div className="tech-label mb-4">Error / 404</div>
        <h1 className="font-display text-display-md font-medium leading-[0.9]">
          NOT HERE.
          <br />
          <span className="text-steel">YET.</span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-steel">
          The page you&apos;re after doesn&apos;t exist — but the instrument you&apos;re after can.
        </p>
        <div className="mt-8 flex gap-3">
          <CTAButton href="/" variant="secondary">Home</CTAButton>
          <CTAButton href="/build" variant="primary">Build Your Aristides</CTAButton>
        </div>
      </div>
    </section>
  );
}

import { Hero } from "@/components/home/Hero";
import { PortfolioReel } from "@/components/home/PortfolioReel";
import { Positioning } from "@/components/home/Positioning";
import { ChooseYourStory } from "@/components/home/ChooseYourStory";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { TestimonialFeature } from "@/components/home/TestimonialFeature";
import { AboutPreview } from "@/components/home/AboutPreview";
import { JournalPreview } from "@/components/home/JournalPreview";
import { CTASection } from "@/components/CTASection";

/**
 * The homepage is a guided cinematic sequence:
 * emotion → portfolio quality → service match → trust → process → social proof → booking.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <PortfolioReel />
      <Positioning />
      <ChooseYourStory />
      <ProcessTimeline />
      <TestimonialFeature />
      <AboutPreview />
      <JournalPreview />
      <CTASection />
    </>
  );
}

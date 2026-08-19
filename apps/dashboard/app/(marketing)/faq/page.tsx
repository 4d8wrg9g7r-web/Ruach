import type { Metadata } from "next";
import { EyebrowLabel } from "../../../components/marketing/EyebrowLabel";
import { FadeIn } from "../../../components/marketing/FadeIn";
import { FAQAccordion, type FAQItem } from "../../../components/marketing/FAQAccordion";
import { JsonLd } from "../../../components/marketing/JsonLd";
import { pageMetadata } from "../../../lib/marketing/page-metadata";
import { faqPageSchema } from "../../../lib/marketing/schema";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Answers to common questions about Ruach's conversational assistant, AI guardrails, Prayer Wall, setup, and pricing.",
  path: "/faq",
});

const PRODUCT: FAQItem[] = [
  {
    question: "What is Ruach?",
    answer:
      "Ruach is a conversational assistant and Prayer Wall for church websites. It helps visitors find sermons, articles, ministry pages, and other resources your church has already created, and gives your community a moderated place to submit and pray for requests.",
  },
  {
    question: "Is Ruach a chatbot?",
    answer:
      "It's a conversational search experience grounded entirely in your church's own content. It doesn't chat about arbitrary topics -- it answers questions by recommending resources your church has approved.",
  },
  {
    question: "What kinds of resources can it search?",
    answer:
      "Sermon videos, podcast episodes, articles, blog posts, ministry pages, event pages, sermon notes, and external links -- anything your church imports or adds to its resource library.",
  },
  {
    question: "Can we add sermons or teaching from other ministries or speakers?",
    answer:
      "Yes. No church has taught on everything -- if your own library has a gap, add a video, podcast episode, or article from another ministry or speaker you trust. Ruach recommends it just like anything from your own library, and always links back to its original source.",
  },
  {
    question: "Can it work with our existing website?",
    answer:
      "Yes. Ruach installs as a small embed script on any website, regardless of platform, and doesn't require rebuilding or replacing your site.",
  },
  {
    question: "Do we have to rebuild our site?",
    answer: "No. Ruach adds a widget to your existing site -- your website itself stays exactly as it is.",
  },
  {
    question: "Can we customize the assistant?",
    answer:
      "Yes -- accent color, logo, assistant name, welcome message, and (on Growth and above) suggested questions can all be set from your dashboard.",
  },
  {
    question: "Can we use more than one widget?",
    answer: "Yes, on Growth and Multi-Site plans. Each widget can have its own branding and can be scoped to a specific website.",
  },
  {
    question: "Can each campus have a different experience?",
    answer:
      "On the Multi-Site plan, each campus can have its own website, widget, content scoping, and Prayer Wall, alongside a shared church-wide experience.",
  },
];

const AI_AND_TRUST: FAQItem[] = [
  {
    question: "Does Ruach make up answers?",
    answer:
      "No. Every recommendation is validated against your church's actual resource library before it's shown to a visitor -- Ruach can't recommend something that isn't in your approved content.",
  },
  {
    question: "Does Ruach search the open internet?",
    answer: "No. Ruach only searches content your church has imported and approved. It has no access to the open internet.",
  },
  {
    question: "Can it answer theological questions?",
    answer:
      "Ruach points people toward your church's own sermons, teaching, and resources on a topic. It doesn't generate independent theological opinions or doctrine.",
  },
  {
    question: "Does Ruach replace pastoral care?",
    answer:
      "No. Ruach is built to support ministry, not replace it -- it helps people find a next step, including reaching out to your church directly, rather than standing in for pastoral relationships.",
  },
  {
    question: "Can we control what content it uses?",
    answer:
      "Yes. Every resource goes through your review before it's active, and you can edit, rescope, or remove any resource at any time.",
  },
  {
    question: "What happens when it cannot find an answer?",
    answer:
      "Visitors see a clear, honest message that nothing matched their question, instead of a fabricated or unrelated recommendation.",
  },
  {
    question: "Can we review conversations or analytics?",
    answer:
      "Yes. Your Analytics dashboard shows the questions being asked, which resources are opened, and where visitors aren't finding what they need.",
  },
];

const PRAYER_WALL: FAQItem[] = [
  {
    question: "Can prayer requests be private?",
    answer: "Yes. A requester can choose to keep a request private, visible only to authorized church staff.",
  },
  {
    question: "Can people submit anonymously?",
    answer: "Yes. Anonymous requests hide the requester's name from anyone viewing the public wall.",
  },
  {
    question: "Does every request appear immediately?",
    answer:
      "No. Every public request passes through moderation first -- nothing appears on the public wall until a staff member or moderator reviews it.",
  },
  {
    question: "Can staff moderate requests?",
    answer: "Yes. Staff can publish, hide, categorize, add internal notes, and mark requests answered from a dedicated moderation dashboard.",
  },
  {
    question: "Can requests be marked as answered?",
    answer: "Yes, and answered requests can be shown on the public wall as a way to celebrate what's happened.",
  },
  {
    question: "Can prayer teams receive notifications?",
    answer: "Yes, on Growth and above -- new submissions can forward to one or more staff email addresses.",
  },
  {
    question: "Can campuses have separate Prayer Walls?",
    answer: "Yes, on the Multi-Site plan -- each campus can have its own wall alongside the shared church-wide wall.",
  },
];

const SETUP: FAQItem[] = [
  {
    question: "How is Ruach installed?",
    answer: "By adding a single embed script to your website -- the same way you'd add most third-party widgets.",
  },
  {
    question: "Do we need a developer?",
    answer: "Not for day-to-day use. Installing the initial embed script may need someone comfortable editing your site's template, but content and settings are managed entirely from the dashboard.",
  },
  {
    question: "How long does setup take?",
    answer: "Most churches can add a website, import their first content, and install the widget in well under an hour.",
  },
  {
    question: "Can Ruach import an existing sermon archive?",
    answer: "Yes -- you can bulk-import from a channel or feed, or add resources individually.",
  },
  {
    question: "Does it support YouTube or Vimeo?",
    answer: "Yes -- both are supported content sources, alongside RSS feeds and manually added links.",
  },
  {
    question: "Can we add content manually?",
    answer: "Yes. Any resource can be added by URL or entered manually if it isn't available through a supported source.",
  },
];

const PRICING: FAQItem[] = [
  {
    question: "Is there a free plan?",
    answer:
      "There isn't a public free plan today. Beta or founding-partner access is sometimes available by invitation -- reach out if you'd like to ask.",
  },
  {
    question: "Is annual billing discounted?",
    answer: "Yes -- annual billing includes two months free compared to paying monthly.",
  },
  {
    question: "What counts as a question?",
    answer: "Each message a visitor sends to the assistant counts as one question toward your plan's monthly total.",
  },
  {
    question: "What happens when we reach our monthly limit?",
    answer:
      "You'll get a warning email well before you're close to your limit. Reaching it doesn't cut off your website -- our team will reach out to help you find the right plan.",
  },
  {
    question: "Can we change plans later?",
    answer: "Yes, you can upgrade or downgrade at any time from your billing dashboard.",
  },
  {
    question: "Is there an enterprise plan?",
    answer: "Yes -- for church networks, denominations, and large ministries with custom requirements. Contact us to talk through your needs.",
  },
  {
    question: "Do you offer help for small churches?",
    answer:
      "The Essential plan is intentionally priced to be attainable for a small church or church plant, and includes the full core Ruach experience.",
  },
];

const CATEGORIES = [
  { title: "Product", items: PRODUCT },
  { title: "AI and Trust", items: AI_AND_TRUST },
  { title: "Prayer Wall", items: PRAYER_WALL },
  { title: "Setup", items: SETUP },
  { title: "Pricing", items: PRICING },
];

/** Makes every question below eligible for FAQ rich results in search. */
const FAQ_STRUCTURED_DATA = faqPageSchema(CATEGORIES.flatMap((category) => category.items));

export default function FAQPage() {
  return (
    <div>
      <JsonLd data={FAQ_STRUCTURED_DATA} />
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center">
        <FadeIn>
          <EyebrowLabel>FAQ</EyebrowLabel>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">Questions, answered directly.</h1>
        </FadeIn>
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-14 px-5">
          {CATEGORIES.map((category, i) => (
            <FadeIn key={category.title} delay={Math.min(i * 0.05, 0.2)}>
              <h2 className="mb-4 text-lg font-semibold text-ink">{category.title}</h2>
              <FAQAccordion items={category.items} />
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}

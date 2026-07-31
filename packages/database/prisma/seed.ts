/**
 * Idempotent dev seed. Safe to re-run against an already-seeded database — it looks
 * up existing rows by their natural keys (email, slug, publicWidgetId via lookup,
 * organizationId+sourceProvider+externalId) before creating anything.
 *
 * All resources below are FICTIONAL, created for local development and the
 * Playwright e2e golden-path test only (brief §58).
 */
import bcrypt from "bcryptjs";
import {
  actionLinkService,
  collectionService,
  organizationService,
  rawDb,
  resourceService,
  userService,
  websiteService,
  widgetService,
} from "../src/index";

const DEV_USER_EMAIL = "owner@ruach.dev";
const DEV_USER_PASSWORD = "devpassword123";
const ORG_SLUG = "riverside-demo";

type FictionalResourceSeed = {
  externalId: string;
  title: string;
  description: string;
  speakerName: string;
  seriesTitle: string;
  durationSeconds: number;
  primaryTopic: string;
  secondaryTopics: string[];
  lifeSituations: string[];
  questionsAnswered: string[];
  keyTakeaways: string[];
  transcript: string;
};

const FICTIONAL_RESOURCES: FictionalResourceSeed[] = [
  {
    externalId: "mock-yt-anxiety-01",
    title: "[FICTIONAL] Finding Peace When Anxiety Feels Constant",
    description: "A message on practical steps for facing anxious thoughts.",
    speakerName: "Dana Whitfield",
    seriesTitle: "Steady",
    durationSeconds: 1860,
    primaryTopic: "Anxiety",
    secondaryTopics: ["Peace", "Worry", "Mental health"],
    lifeSituations: ["Chronic worry", "Racing thoughts", "Burnout"],
    questionsAnswered: [
      "How do I stop spiraling into anxious thoughts?",
      "Is it okay to feel anxious and still have faith?",
      "What are practical steps for calming down in the moment?",
    ],
    keyTakeaways: ["Name the worry out loud", "Small grounding practices help", "You are not alone in this"],
    transcript:
      "Fictional transcript excerpt: Anxiety can feel like a weight that never lifts. Tonight we're talking " +
      "through three practical steps for facing anxious thoughts without being ruled by them: naming what's " +
      "actually worrying you, grounding yourself in the present moment, and reaching out instead of isolating.",
  },
  {
    externalId: "mock-yt-forgiveness-01",
    title: "[FICTIONAL] What Forgiveness Actually Requires",
    description: "Untangling forgiveness from reconciliation and excusing harm.",
    speakerName: "Marcus Ibe",
    seriesTitle: "Steady",
    durationSeconds: 2220,
    primaryTopic: "Forgiveness",
    secondaryTopics: ["Bitterness", "Reconciliation", "Offense"],
    lifeSituations: ["Betrayal", "Broken trust", "Holding a grudge"],
    questionsAnswered: [
      "How do I forgive someone who isn't sorry?",
      "Does forgiveness mean reconciliation?",
      "How do I let go of bitterness?",
    ],
    keyTakeaways: ["Forgiveness is a decision, not a feeling", "Reconciliation is a separate, optional step"],
    transcript:
      "Fictional transcript excerpt: Forgiveness gets confused with a lot of things it isn't. It isn't pretending " +
      "the harm didn't happen. It isn't automatic reconciliation. It's a decision to stop demanding payment " +
      "for a debt someone else owes you, so it stops running your life.",
  },
  {
    externalId: "mock-yt-leadership-01",
    title: "[FICTIONAL] Leading When You Don't Feel Ready",
    description: "A practical talk on leadership development for new leaders.",
    speakerName: "Priya Anand",
    seriesTitle: "Formation",
    durationSeconds: 2040,
    primaryTopic: "Leadership",
    secondaryTopics: ["Confidence", "Team building", "Growth"],
    lifeSituations: ["New to a leadership role", "Self-doubt", "Team conflict"],
    questionsAnswered: ["How do I lead a team I used to be a peer on?", "What if I don't feel qualified?"],
    keyTakeaways: ["Competence follows action, not the reverse", "Ask better questions before giving answers"],
    transcript:
      "Fictional transcript excerpt: Nobody feels fully ready the first time they lead. Today, three shifts that " +
      "matter more than confidence: asking better questions before jumping to answers, protecting your team's " +
      "time, and admitting what you don't know out loud.",
  },
  {
    externalId: "mock-yt-marriage-01",
    title: "[FICTIONAL] Practical Communication for Married Couples",
    description: "Concrete communication tools, not just encouragement.",
    speakerName: "Dana Whitfield",
    seriesTitle: "Together",
    durationSeconds: 1980,
    primaryTopic: "Marriage",
    secondaryTopics: ["Communication", "Conflict"],
    lifeSituations: ["Recurring arguments", "Feeling unheard"],
    questionsAnswered: ["How do we stop having the same fight?", "How do I feel heard by my spouse?"],
    keyTakeaways: ["Repeat back what you heard before responding", "Schedule hard conversations instead of ambushing"],
    transcript:
      "Fictional transcript excerpt: Most marriage conflict isn't about the dishes or the calendar — it's about " +
      "feeling unheard. Tonight, one practical tool: reflect back what your spouse said before you respond, " +
      "every time, even when you're sure you already understand.",
  },
  {
    externalId: "mock-yt-grief-01",
    title: "[FICTIONAL] Grief Doesn't Follow a Schedule",
    description: "Sitting with loss without rushing toward resolution.",
    speakerName: "Marcus Ibe",
    seriesTitle: "Steady",
    durationSeconds: 1740,
    primaryTopic: "Grief",
    secondaryTopics: ["Loss", "Comfort"],
    lifeSituations: ["Recent loss", "Grief anniversary", "Complicated grief"],
    questionsAnswered: ["Why do I still feel this way months later?", "How long is grief supposed to last?"],
    keyTakeaways: ["Grief isn't linear", "You don't need to be done grieving to keep living"],
    transcript:
      "Fictional transcript excerpt: There's no schedule for grief, no matter how many people expect you to be " +
      "'over it' by now. Grief comes back in waves, especially around anniversaries, and that doesn't mean " +
      "you're doing it wrong.",
  },
  {
    externalId: "mock-yt-waiting-01",
    title: "[FICTIONAL] Trusting Through the Waiting",
    description: "On staying faithful when circumstances aren't changing.",
    speakerName: "Priya Anand",
    seriesTitle: "Formation",
    durationSeconds: 2100,
    primaryTopic: "Waiting",
    secondaryTopics: ["Trust", "Discouragement", "Unanswered prayer"],
    lifeSituations: ["Delayed answers", "Spiritual discouragement", "Uncertainty"],
    questionsAnswered: ["How do I keep trusting when nothing is changing?", "Why does waiting feel so hard?"],
    keyTakeaways: ["Waiting isn't wasted time", "Faithfulness in small things compounds"],
    transcript:
      "Fictional transcript excerpt: Waiting seasons feel wasted because nothing visible is changing. But " +
      "faithfulness in the small, unseen decisions during a waiting season is exactly what shapes who you " +
      "become when the answer finally comes.",
  },
  {
    externalId: "mock-yt-newbeliever-01",
    title: "[FICTIONAL] Starting Point: Your First 30 Days",
    description: "A short orientation series for people brand new to faith.",
    speakerName: "Priya Anand",
    seriesTitle: "Starting Point",
    durationSeconds: 900,
    primaryTopic: "New believers",
    secondaryTopics: ["Faith basics", "Getting started"],
    lifeSituations: ["Brand new to faith", "Overwhelmed by where to start"],
    questionsAnswered: ["Where do I even start?", "What should I read first?"],
    keyTakeaways: ["Start small and consistent, not exhaustive", "Community matters more than solo study"],
    transcript:
      "Fictional transcript excerpt: If you're brand new here, you don't need to have it all figured out. Start " +
      "with fifteen minutes a day and one conversation a week with someone a little further down the road " +
      "than you.",
  },
];

async function main() {
  console.log("Seeding Ruach dev database...");

  let user = await userService.findUserByEmail(DEV_USER_EMAIL);
  if (!user) {
    const passwordHash = await bcrypt.hash(DEV_USER_PASSWORD, 10);
    user = await userService.createUser({ email: DEV_USER_EMAIL, name: "Dev Owner", passwordHash });
    console.log(`Created dev user ${DEV_USER_EMAIL} / ${DEV_USER_PASSWORD}`);
  } else {
    console.log(`Dev user ${DEV_USER_EMAIL} already exists`);
  }

  let organization = await organizationService.getOrganizationBySlug(ORG_SLUG);
  if (!organization) {
    organization = await organizationService.createOrganizationWithOwner({
      name: "Riverside Fellowship (Demo Org — fictional)",
      slug: ORG_SLUG,
      ownerUserId: user.id,
    });
    console.log(`Created organization ${organization.name}`);
  } else {
    console.log(`Organization ${ORG_SLUG} already exists`);
  }

  const existingWebsites = await websiteService.listWebsites(organization.id);
  let website = existingWebsites[0];
  if (!website) {
    website = await websiteService.createWebsite({
      organizationId: organization.id,
      name: "Riverside Fellowship Website",
      primaryDomain: "localhost:3000",
      allowedDomains: ["localhost:3000", "127.0.0.1:3000"],
    });
    console.log(`Created website ${website.primaryDomain}`);
  }

  const existingWidgets = await widgetService.listWidgets(organization.id);
  let widgetPublicId = existingWidgets[0]?.publicWidgetId;
  if (!widgetPublicId) {
    const created = await widgetService.createWidget({
      organizationId: organization.id,
      websiteId: website.id,
      name: "Main Resource Assistant",
      assistantName: "Riverside Guide",
      welcomeMessage: "Hi! Looking for a video, sermon, or resource on something specific?",
      suggestedPrompts: [
        "Do you have anything about anxiety?",
        "I need help with forgiveness.",
        "What should I watch first?",
      ],
    });
    widgetPublicId = created.publicWidgetId;
    console.log(`Created widget ${created.name} (${created.publicWidgetId})`);
  }

  const collections = await collectionService.listCollections(organization.id);
  if (collections.length === 0) {
    await collectionService.createCollection({
      organizationId: organization.id,
      name: "Sunday Messages",
      slug: "sunday-messages",
      description: "Weekly teaching content.",
    });
    console.log("Created collection: Sunday Messages");
  }

  const actionLinks = await actionLinkService.listActiveActionLinks(organization.id);
  if (actionLinks.length === 0) {
    await actionLinkService.createActionLink({
      organizationId: organization.id,
      label: "Contact us",
      type: "CONTACT",
      url: "https://example.org/contact",
    });
    await actionLinkService.createActionLink({
      organizationId: organization.id,
      label: "Submit a prayer request",
      type: "PRAYER_REQUEST",
      url: "https://example.org/prayer",
    });
    console.log("Created default action links");
  }

  let createdCount = 0;
  for (const item of FICTIONAL_RESOURCES) {
    const existing = await resourceService.findResourceBySource(organization.id, "YOUTUBE", item.externalId);
    if (existing) continue;

    const resource = await resourceService.createResource({
      organizationId: organization.id,
      resourceType: "SERMON",
      sourceProvider: "YOUTUBE",
      externalId: item.externalId,
      title: item.title,
      description: item.description,
      speakerName: item.speakerName,
      seriesTitle: item.seriesTitle,
      durationSeconds: item.durationSeconds,
      thumbnailUrl: `https://i.ytimg.com/vi/${item.externalId}/hqdefault.jpg`,
      publicUrl: `https://www.youtube.com/watch?v=${item.externalId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${item.externalId}`,
    });

    await resourceService.setTranscript(organization.id, resource.id, item.transcript, "MANUAL_TRANSCRIPT");

    const searchDocument = [
      `# ${item.title}`,
      `SPEAKER: ${item.speakerName}`,
      `SERIES: ${item.seriesTitle}`,
      `TOPICS: ${[item.primaryTopic, ...item.secondaryTopics].join(", ")}`,
      "## Summary",
      item.description,
      "## Questions This Resource May Help Answer",
      ...item.questionsAnswered.map((q) => `- ${q}`),
      "## Life Situations",
      ...item.lifeSituations.map((s) => `- ${s}`),
      "## Transcript",
      item.transcript,
    ].join("\n");

    await resourceService.applyCategorization(organization.id, resource.id, {
      summary: item.description,
      primaryTopic: item.primaryTopic,
      secondaryTopics: item.secondaryTopics,
      topics: [item.primaryTopic, ...item.secondaryTopics],
      questionsAnswered: item.questionsAnswered,
      lifeSituations: item.lifeSituations,
      keyTakeaways: item.keyTakeaways,
      searchDocument,
      contentHash: `seed-${item.externalId}`,
    });

    await resourceService.addEvidence({
      organizationId: organization.id,
      resourceId: resource.id,
      fieldName: "primaryTopic",
      generatedValue: item.primaryTopic,
      sourceExcerpt: item.transcript.slice(0, 160),
      confidenceScore: 0.92,
    });

    await resourceService.approveResource(organization.id, resource.id);
    await resourceService.markIndexed(organization.id, resource.id);
    createdCount += 1;
  }
  console.log(`Seeded ${createdCount} fictional resources (${FICTIONAL_RESOURCES.length - createdCount} already existed)`);

  console.log("\nSeed complete.");
  console.log(`  Login: ${DEV_USER_EMAIL} / ${DEV_USER_PASSWORD}`);
  console.log(`  Organization: ${organization.name} (${organization.slug})`);
  console.log(`  Widget public ID: ${widgetPublicId}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await rawDb.$disconnect();
  });

import { MockAIProvider } from "./MockAIProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import type { AIProvider } from "./AIProvider";

export type {
  AIProvider,
  LinkCandidate,
  LinkMatchOutput,
  CategorizationInput,
  CategorizationOutput,
  CategorizationSourceDocument,
  ConversationalResponseInput,
  ConversationalResponseOutput,
  GeneratedField,
} from "./AIProvider";
export { MockAIProvider } from "./MockAIProvider";
export { OpenAIProvider } from "./OpenAIProvider";
export { CategorizationService } from "./CategorizationService";
export { ChatPipeline } from "./ChatPipeline";
export type { ChatPipelineInput } from "./ChatPipeline";

let cachedProvider: AIProvider | null = null;

/** Selects MockAIProvider unless OPENAI_API_KEY is set (brief §57). Cached per process. */
export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;
  const apiKey = process.env.OPENAI_API_KEY;
  cachedProvider = apiKey ? new OpenAIProvider(apiKey) : new MockAIProvider();
  return cachedProvider;
}

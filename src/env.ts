const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not defined");

const LLM_TYPE = process.env.LLM_TYPE || "gpt-3.5-turbo-16k-0613";

const REFACTOR_REQUEST_PROMPT = process.env.SYSTEM_PROMPT ||
  "Refactor the codes following user's request. Follow the instructions and return ONLY the code. Your output will be used to refactor the code, so DO NOT wrap the code with Markdown syntax or any other text.";

export { LLM_TYPE, OPENAI_API_KEY, REFACTOR_REQUEST_PROMPT };

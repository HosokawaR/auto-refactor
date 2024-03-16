import OpenAI, {
  RateLimitError,
} from "https://deno.land/x/openai@v4.29.1/mod.ts";
import { OPENAI_API_KEY, REFACTOR_REQUEST_PROMPT } from "./env.ts";
import { LLM_TYPE } from "./env.ts";
import { sleep } from "./utls.ts";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const refactor = async (
  codes: string,
  instruction: string,
): Promise<string> => {
  const completion = await openai.chat.completions.create({
    model: LLM_TYPE,
    messages: [
      {
        role: "system",
        content: REFACTOR_REQUEST_PROMPT,
      },
      {
        role: "user",
        content: instruction,
      },
      {
        role: "user",
        content: codes,
      },
    ],
  });

  return completion.choices[0].message.content;
};

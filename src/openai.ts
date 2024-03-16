import OpenAI, { RateLimitError } from "openai";
import { OPENAI_API_KEY, REFACTOR_REQUEST_PROMPT } from "./env";
import { LLM_TYPE } from "./env";
import { sleep } from "./utls";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const refactor = async (
  codes: string,
  instruction: string,
): Promise<string> => {
  try {
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
  } catch (error) {
    if (error instanceof RateLimitError) {
      const retryAfterMs = error.headers["retry-after-ms"];
      console.error(
        `Rate limit exceeded. Retrying in ${retryAfterMs} ms`,
      );
      await sleep(Number(retryAfterMs));
      return refactor(codes, instruction);
    }

    throw error;
  }
};

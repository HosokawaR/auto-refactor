import { refactor } from "./openai.ts";
import { loadAndValidateInstructions } from "./instruction.ts";
import { retry, sleep } from "./utls.ts";
import { expandGlob } from "https://deno.land/std@0.220.1/fs/expand_glob.ts";
import { RateLimitError } from "https://deno.land/x/openai@v4.29.1/error.ts";

const args = Deno.args;

if (args.length !== 1) {
  console.error("Usage: node main.js <instructions file path>");
  Deno.exit(1);
}

const instructions = loadAndValidateInstructions(args[0]);

instructions.forEach(async (instraction) => {
  const entries = await Array.fromAsync(expandGlob(instraction.targetFileGlob));
  const paths = [...entries]
    .filter((entry) => {
      if (!entry.isFile) return false;
      const content = Deno.readTextFileSync(entry.path);
      if (!instraction.filterFunction) return true;
      return instraction.filterFunction(entry.path, content);
    })
    .map((entry) => entry.path);

  let count = 1;
  for await (const path of paths) {
    const codes = Deno.readTextFileSync(path);

    let refactoredCode: string | undefined = undefined;
    await retry(
      async () => {
        refactoredCode = await refactor(codes, instraction.instruction);
      },
      async (error, _) => {
        console.error(`Failed to refactor ${path}: ${error}`);

        let sleepMs = 1000;
        if (error instanceof RateLimitError) {
          const retryAfterMs = error.headers?.["retry-after-ms"];
          sleepMs = Number(retryAfterMs) || 1000;
        }

        await sleep(sleepMs);

        return true;
      },
      async (error) => {
        console.error(`Failed to all attempts to refactor ${path}: ${error}`);
      },
    );

    if (!refactoredCode) {
      console.error(`Failed to refactor ${path}`);
      continue;
    }

    console.info(`Refactored (${count}/${paths.length}): ${path}`);
    Deno.writeTextFileSync(path, refactoredCode);
    count += 1;
  }
});

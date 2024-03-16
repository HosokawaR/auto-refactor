import * as fs from "fs";
import * as glob from "glob";
import { refactor } from "./openai";
import { loadAndValidateInstructions } from "./instruction";
import { retry } from "./utls";

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error("Usage: node main.js <instructions file path>");
  process.exit(1);
}

const instructions = loadAndValidateInstructions(args[0]);

instructions.forEach(async (instraction) => {
  const files = glob.sync(instraction.targetFileGlob);

  const filteredFilePaths = files.filter((file) => {
    const content = fs.readFileSync(file, "utf-8");
    if (!instraction.filterFunction) return true;
    return instraction.filterFunction(file, content);
  });

  let count = 1;

  for await (const path of filteredFilePaths) {
    const codes = fs.readFileSync(path, "utf-8");

    retry(
      async () => {
        const refactoredCode = await refactor(codes, instraction.instruction);
        console.info(
          `Refactored (${count}/${filteredFilePaths.length}): ${path}`,
        );
        fs.writeFileSync(path, refactoredCode);
        count += 1;
      },
      async (error, attemptsCount) => {
        console.error(
          `Error while refactoring ${path} (attempt ${attemptsCount}): ${error}`,
        );
        return true;
      },
      async (error) => {
        console.error(`Failed to all attempts to refactor ${path}: ${error}`);
      },
    );
  }
});

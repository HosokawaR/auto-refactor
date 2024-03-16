import z from "zod";
import { parse } from "yaml";

import * as fs from "fs";

const instructionFileSchema = z.array(
  z.object({
    targetFileGlob: z.string(),
    instruction: z.string(),
    filterFunction: z.string().optional(),
  }),
);

export type Instructions = {
  targetFileGlob: string;
  instruction: string;
  filterFunction?: (path: string, content: string) => boolean;
}[];

export const loadAndValidateInstructions = (path: string): Instructions => {
  const instructions = instructionFileSchema.parse(
    parse(fs.readFileSync(path, "utf-8")),
  );

  return instructions.map((instruction) => {
    if (!instruction.filterFunction) {
      return {
        targetFileGlob: instruction.targetFileGlob,
        instruction: instruction.instruction,
        filterFunction: undefined,
      };
    }

    try {
      const f = eval(instruction.filterFunction);
      if (typeof f !== "function") {
        throw new Error("Filter function is not a function");
      }
      return { ...instruction, filterFunction: f } as Instructions[number];
    } catch (error) {
      console.error(
        `Error while evaluating filter function for instruction: ${instruction}`,
      );
      throw error;
    }
  });
};

import {GoogleLLM, handle as GoogleHandle} from "./handlers/google";
import {LLMContentPart} from "./types";
import {sleep} from "../util";
import { z } from "zod";

const DEFAULT_RETRY_LIMIT = 3;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 10000; // 10 seconds

export enum LLMType {
    ANTHROPIC,
    GOOGLE,
    OPEN_AI
}

export type LLM = { type: LLMType.GOOGLE, model: GoogleLLM };

export const LLM_PRESET: { [key: string]: LLM } = {
  strong: { type: LLMType.GOOGLE, model: GoogleLLM.GEMINI_1_5_PRO },
  normal: { type: LLMType.GOOGLE, model: GoogleLLM.GEMINI_1_5_FLASH }
}

export async function handle<T extends z.ZodTypeAny>(
    llm: LLM,
    llmContentParts: LLMContentPart[],
    schema: T
) {
    let response: string;
    let retryCount = 0;
    let latestError: any;

    while (retryCount < DEFAULT_RETRY_LIMIT) {
        try {
            switch (llm.type) {
                case LLMType.GOOGLE:
                    response = await GoogleHandle(llmContentParts, llm.model, schema);
                    break;
            }

            return response as z.infer<T>;
        } catch (err) {
          console.error(err);
            retryCount++;
            latestError = err;

            if (retryCount < DEFAULT_RETRY_LIMIT) {
                // Calculate delay with exponential backoff
                const delay = Math.min(BASE_DELAY * Math.pow(2, retryCount - 1), MAX_DELAY);
                await sleep(delay);
            }
        }
    }

    throw latestError;
}
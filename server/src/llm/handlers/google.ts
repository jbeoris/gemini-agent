import { GenerateContentResult, GoogleGenerativeAI, Part } from "@google/generative-ai";
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { downloadImage, toGeminiSchema } from '../../util';
import {EmptyResponseError} from "../error";
import { z } from "zod";
import { LLMContentPart, VideoMimeType } from "../types";
import * as GeminiUtil from '../util/gemini';

export enum GoogleLLM {
    GEMINI_1_5_PRO = 'gemini-1.5-pro',
    GEMINI_1_5_FLASH = 'gemini-1.5-flash'
}

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path: string, mimeType: any) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

async function videoToFileDataPart(path: string, mimeType: VideoMimeType) {
  const fileData = await GeminiUtil.uploadAndVerifyFile(
    path,
    'User uploaded video',
    mimeType
  );

  return { fileData };
}

export async function handle<T extends z.ZodTypeAny>(
  llmContentParts: LLMContentPart[], 
  googleLLM: GoogleLLM, 
  schema: T
) {
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const responseSchema = toGeminiSchema(schema);

    const model = genAI.getGenerativeModel({
      model: googleLLM,
      generationConfig: schema instanceof z.ZodString ? undefined : {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const parts: (string | Part)[] = []
    const filepaths: string[] = []

    for (const llmContentPart of llmContentParts) {
        switch (llmContentPart.type) {
            case 'text': {
                parts.push(llmContentPart.text);
                break;
            }
            case 'image': {
                const source_filename = `source_${uuidv4()}.${llmContentPart.mimetype.split('/').pop()}`;
                const source_filepath = path.join(os.tmpdir(), source_filename);
                await downloadImage(llmContentPart.url, source_filepath);
                filepaths.push(source_filepath);
                parts.push(fileToGenerativePart(source_filepath, llmContentPart.mimetype));
                break;
            }
            case 'video': {
              const source_filename = `source_${uuidv4()}.${llmContentPart.mimetype.split('/').pop()}`;
              const source_filepath = path.join(os.tmpdir(), source_filename);
              await downloadImage(llmContentPart.url, source_filepath);
              filepaths.push(source_filepath);
              parts.push(await videoToFileDataPart(source_filepath, llmContentPart.mimetype));
            }
        }
    }

    let result: GenerateContentResult; 

    try {
      result = await model.generateContent(parts);
    } catch (err) {
      console.log(err, llmContentParts);
      throw err
    }

    for (const filepath of filepaths) {
        fs.unlinkSync(filepath);
    }

    const response = result.response;
    
    let text: string;

    try {
      text = response.text()
    } catch (err) {
      console.log(err, llmContentParts);
      throw err
    }

    if (!text) throw EmptyResponseError;

    return schema.parse(
      schema instanceof z.ZodString ? 
      text.trim() : 
      JSON.parse(text.trim())
    ) as z.infer<T>;
}
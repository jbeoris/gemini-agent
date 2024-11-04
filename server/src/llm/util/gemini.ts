// To use the File API, use this import path for GoogleAIFileManager.
// Note that this is a different import path than what you use for generating content.
// For versions lower than @google/generative-ai@0.13.0
// use "@google/generative-ai/files"
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { VideoMimeType } from "../types";
import { z } from 'zod';

// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY ?? '');

export const GeminiFileData = z.object({
  fileUri: z.string().url(),
  mimeType: VideoMimeType
})
export type GeminiFileData = z.infer<typeof GeminiFileData>;

export async function uploadAndVerifyFile(
  filepath: string,
  displayName: string,
  mimeType: VideoMimeType
): Promise<{ fileUri: string, mimeType: VideoMimeType}> {
  // Upload the file and specify a display name.
  const uploadResponse = await fileManager.uploadFile(filepath, {
    mimeType,
    displayName,
  });
  
  const name = uploadResponse.file.name;
  
  // Poll getFile() on a set interval (10 seconds here) to check file state.
  let file = await fileManager.getFile(name);
  while (file.state === FileState.PROCESSING) {
    process.stdout.write(".")
    // Sleep for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    // Fetch the file from the API again
    file = await fileManager.getFile(name)
  }
  
  if (file.state === FileState.FAILED) {
    throw new Error("Video processing failed.");
  }

  return GeminiFileData.parse({
    fileUri: uploadResponse.file.uri,
    mimeType: uploadResponse.file.mimeType
  });
}
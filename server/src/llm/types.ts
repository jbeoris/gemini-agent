import { z } from 'zod';

export const ImageMimeType = z.enum(['image/jpeg', 'image/png']);
export type ImageMimeType = z.infer<typeof ImageMimeType>;

export const VideoMimeType = z.enum(['video/mp4']);
export type VideoMimeType = z.infer<typeof VideoMimeType>;

export const ImageUrlAndType = z.object({ 
  url: z.string(), 
  mimetype: ImageMimeType
});
export type ImageUrlAndType = z.infer<typeof ImageUrlAndType>;

export const VideoUrlAndType = z.object({ 
  url: z.string(), 
  mimetype: VideoMimeType
});
export type VideoUrlAndType = z.infer<typeof VideoUrlAndType>;

export type LLMContentPart = (
    { type: 'text', text: string } |
    { type: 'image', url: string, mimetype: ImageMimeType } |
    { type: 'video', url: string, mimetype: VideoMimeType }
);

export const LLMWorkflowId = z.enum(['agent_looper']);
export type LLMWorkflowId = z.infer<typeof LLMWorkflowId>;

export const LLMWorkflow = z.object({
  id: LLMWorkflowId,
  prompt: z.string(),
  name: z.string(),
  description: z.string(),
  deprecated: z.boolean().optional()
});
export type LLMWorkflow = z.infer<typeof LLMWorkflow>;

export const LLMWorkflowExec = LLMWorkflow.extend({
  exec: z.any(),
  maker: z.any(),
  function: z.any(),
  args: z.any()
});
export type LLMWorkflowExec = z.infer<typeof LLMWorkflowExec>;

export const AgentTool = z.object({
    id: z.string(),
    name: z.string(),
    input_schema: z.any(),
    output_schema: z.any()
})
export type AgentTool = z.infer<typeof AgentTool>;

export const AgentToolInvocation = z.object({
    tool_id: z.string(),
    tool_input: z.any(),
    tool_ouptut: z.any(),
});
export type AgentToolInvocation = z.infer<typeof AgentToolInvocation>;

export const AgentLooperResponse = z.object({
    next_tool: z.string().nullable(), // The ID of the next tool to call, if any
    next_tool_input: z.object({
        text: z.string()
    }).nullable(), // The input data for the next tool, if any
    response_ready: z.boolean(), // Indicates if the response is ready to return to the user
    response: z.string().nullable() // The final response, if ready
});
export type AgentLooperResponse = z.infer<typeof AgentLooperResponse>;
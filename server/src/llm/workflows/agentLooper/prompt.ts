import Function, { Args } from './function';
import { readFileSync } from 'fs';
import { toGeminiSchema } from 'gemini-zod';
import { join } from 'path';

const readPromptFile = () => {
  const promptPath = join(__dirname, 'prompt.txt');
  return readFileSync(promptPath, 'utf-8');
};

export const prompt = readPromptFile();

export const maker = Function.implement((args: Args) => {
    const agentTools = [];

    for (const agentTool of args.agent_tools) {
        agentTools.push({
            id: agentTool.id,
            name: agentTool.name,
            input_schema: toGeminiSchema(agentTool.input_schema),
            output_schema: toGeminiSchema(agentTool.output_schema)
        })
    }

    return prompt
        .replaceAll('${original_input}', args.original_input)
        .replaceAll('${agent_tools}', JSON.stringify(agentTools, null, 2))
        .replaceAll('${agent_tool_invocations}', JSON.stringify(args.agent_tool_invocations, null, 2))
        .replaceAll('${finalize}', args.finalize ? 'true' : 'false');
})
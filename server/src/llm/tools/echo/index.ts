import { z } from 'zod';
import { AgentTool } from '../../types';

export const EchoTool: AgentTool = {
    id: 'echo',
    name: 'Echo Tool',
    input_schema: z.object({
        text: z.string()
    }),
    output_schema: z.object({
        echoed_text: z.string()
    })
};

export async function echoToolFunction(input: { text: string }) {
    return { echoed_text: input.text };
}
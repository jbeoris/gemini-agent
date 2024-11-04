import { z } from 'zod';
import { AgentTool } from '../../types';
import * as SerperAPI from '../../../serperAPI';

export const SearchTool: AgentTool = {
    id: 'search',
    name: 'Search Tool',
    input_schema: z.object({
        text: z.string()
    }),
    output_schema: z.object({
        search_result: z.string()
    })
};

export async function searchToolFunction(input: { text: string }) {
    const result = await SerperAPI.get(input.text)
    return { search_result: result };
}
import { z } from 'zod';
import { AgentTool, AgentToolInvocation } from '../../types';

export const Args = z.object({
    original_input: z.string(),
    agent_tools: z.array(AgentTool),
    agent_tool_invocations: z.array(AgentToolInvocation).optional().default([]),
    finalize: z.boolean().optional().default(false)
})
export type Args = z.infer<typeof Args>;

export const Function = z
  .function()
  .args(Args);
export type Function = z.infer<typeof Function>;

export default Function;
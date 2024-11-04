import dotenv from 'dotenv';

dotenv.config();

import { Args as AgentLooperArgs } from './llm/workflows/agentLooper/function';
import { LLMWorkflowId } from './llm/types';
import LLMWorkflows from './llm/workflows';
import { getAllTools } from './llm/tools';

async function main() {
    const response = await LLMWorkflows[LLMWorkflowId.enum.agent_looper].exec({
        original_input: "What time is it in NYC right now?",
        agent_tools: getAllTools()
    } as AgentLooperArgs);
    
    return response;
}

main()
    .then(console.log)
    .catch(console.trace)
    .finally(() => process.exit())
import * as Prompt from "./prompt";
import { AgentLooperResponse, LLMContentPart, LLMWorkflowExec, LLMWorkflowId } from "../../types";
import Function, { Args } from './function';
import * as LLM from '../..';
import { getToolById } from '../../tools';

const MAX_LOOP_COUNT = 10;

const maker = Function.implement((args: Args) => {
    const llmContentParts: LLMContentPart[] = [];
    llmContentParts.push({ type: 'text', text: Prompt.maker(args) });
    return llmContentParts;
});

const workflow: LLMWorkflowExec = {
  id: LLMWorkflowId.enum.agent_looper,
  maker,
  prompt: Prompt.prompt,
  function: Function,
  exec: Function.implement(async (args: Args) => {
    let loopCount = 0;
    let responseReady = false;
    let finalResponse: string | undefined | null;
    let currentArgs: Args = {
        ...args,
        agent_tool_invocations: [],
        finalize: false
    };

    while (loopCount < MAX_LOOP_COUNT && !responseReady) {
      const llmContentParts = maker(currentArgs);
      const response = await LLM.handle(LLM.LLM_PRESET.strong, llmContentParts, AgentLooperResponse);

      if (response.response_ready) {
        responseReady = true;
        finalResponse = response.response;
      } else if (response.next_tool) {
        const toolEntry = getToolById(response.next_tool);
        if (toolEntry) {
          const toolResult = await toolEntry.func(response.next_tool_input);
          currentArgs = {
            ...currentArgs,
            agent_tool_invocations: [
              ...currentArgs.agent_tool_invocations,
              {
                tool_id: response.next_tool,
                tool_input: response.next_tool_input,
                tool_ouptut: toolResult
              }
            ],
            finalize: false
          };
        }
      }

      loopCount++;
    }

    if (!responseReady) {
      // Final loop with signal to finalize response
      const llmContentParts = maker({
        ...currentArgs,
        finalize: true
      });
      const response = await LLM.handle(LLM.LLM_PRESET.strong, llmContentParts, AgentLooperResponse);
      finalResponse = response.response;
    }

    return finalResponse;
  }),
  args: Args,
  name: 'Agent Looper',
  description: 'Basic agent looper.'
};

export default workflow;
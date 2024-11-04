import { LLMWorkflowExec, LLMWorkflowId } from '../types';
import AgentLooper from './agentLooper';

const workflows: { [key in LLMWorkflowId] : LLMWorkflowExec }  = {
  "agent_looper": AgentLooper
}

export default workflows
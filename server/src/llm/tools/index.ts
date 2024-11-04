import { EchoTool, echoToolFunction } from './echo';
import { SearchTool, searchToolFunction } from './search';
import { AgentTool } from '../types';

const tools: { [key: string]: { tool: AgentTool, func: Function } } = {
    [EchoTool.id]: { tool: EchoTool, func: echoToolFunction },
    [SearchTool.id]: { tool: SearchTool, func: searchToolFunction }
};

export function getToolById(toolId: string) {
    return tools[toolId];
}

export function getAllTools() {
    return Object.values(tools).map(toolEntry => toolEntry.tool);
}
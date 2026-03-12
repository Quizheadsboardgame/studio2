'use server';
/**
 * @fileOverview A flow to parse natural language into a structured Task object.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { format, addDays } from 'date-fns';

const ParseTaskInputSchema = z.object({
  text: z.string().describe('The natural language description of the task.'),
  currentDate: z.string().describe('The current date in yyyy-MM-dd format.'),
  activeUser: z.string().describe('The name of the user currently using the app.'),
});

export type ParseTaskInput = z.infer<typeof ParseTaskInputSchema>;

const ParseTaskOutputSchema = z.object({
  name: z.string().describe('Short name of the task.'),
  owner: z.enum(['Owen', 'Lucy', 'Nick']).describe('The user the task is for.'),
  priority: z.enum(['High', 'Medium', 'Low']).describe('Task priority.'),
  dueDate: z.string().describe('Due date in yyyy-MM-dd format.'),
  startTime: z.string().optional().describe('Start time in HH:mm format.'),
  notes: z.string().optional().describe('Any extra details parsed.'),
});

export type ParseTaskOutput = z.infer<typeof ParseTaskOutputSchema>;

export async function parseTaskAI(input: ParseTaskInput): Promise<ParseTaskOutput> {
  return parseTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseTaskPrompt',
  input: { schema: ParseTaskInputSchema },
  output: { schema: ParseTaskOutputSchema },
  prompt: `You are an expert task organizer. 
Convert the following natural language task description into a structured JSON object.

Current Date: {{{currentDate}}}
Active User (default if not specified): {{{activeUser}}}

Input Text: "{{{text}}}"

Rules:
1. If a name (Owen, Lucy, Nick) is mentioned, assign it to them. Otherwise, default to the active user.
2. If "tomorrow" is mentioned, set date to 1 day after current date.
3. If "later" or "next week" is mentioned, set date to 7 days after current date.
4. Extract time like "at 9am" or "14:00".
5. Determine priority based on keywords like "urgent", "must", "important" (High) or "if you have time" (Low). Default to Medium.
6. Keep the name concise.

Output must be valid JSON matching the schema.`,
});

const parseTaskFlow = ai.defineFlow(
  {
    name: 'parseTaskFlow',
    inputSchema: ParseTaskInputSchema,
    outputSchema: ParseTaskOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('AI could not parse the task.');
    return output;
  }
);

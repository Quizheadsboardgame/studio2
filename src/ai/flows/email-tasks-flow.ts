'use server';
/**
 * @fileOverview A flow to generate a daily task briefing.
 *
 * - generateDailyBriefing - Generates a professional summary of today's tasks.
 * - EmailTasksInput - The input type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EmailTasksInputSchema = z.object({
  userName: z.string().describe('The name of the user receiving the briefing.'),
  userEmail: z.string().email().describe('The email address (for simulation).'),
  tasks: z.array(z.object({
    name: z.string(),
    priority: z.string(),
    startTime: z.string().optional(),
    notes: z.string().optional(),
  })).describe('The list of tasks for today.'),
  date: z.string().describe('The current date string.'),
});

export type EmailTasksInput = z.infer<typeof EmailTasksInputSchema>;

const EmailTasksOutputSchema = z.object({
  success: z.boolean().describe('Whether the briefing was successfully generated.'),
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The full body text of the email briefing.'),
});

export type EmailTasksOutput = z.infer<typeof EmailTasksOutputSchema>;

/**
 * Generates a friendly daily briefing email content using AI.
 */
export async function generateDailyBriefing(input: EmailTasksInput): Promise<EmailTasksOutput> {
  return emailTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyBriefingPrompt',
  input: { schema: EmailTasksInputSchema },
  output: { schema: EmailTasksOutputSchema },
  prompt: `You are FocusFlow's personal productivity assistant. 

Generate a professional, friendly, and highly motivating daily briefing email for {{{userName}}}.

Today's Date: {{{date}}}

Tasks for Today:
{{#if tasks}}
{{#each tasks}}
- [{{priority}} Priority] {{name}} {{#if startTime}}at {{startTime}}{{/if}}
  {{#if notes}}Notes: {{notes}}{{/if}}
{{/each}}
{{else}}
You have no tasks scheduled for today!
{{/if}}

If there are no tasks, wish them a productive day of planning or a well-deserved rest.

The email should include:
1. A catchy, motivating subject line.
2. A warm greeting.
3. A clear summary of their "Big Rocks" (High priority tasks) first.
4. A concise list of other tasks.
5. A motivational closing quote or sentiment.

The output MUST be valid JSON matching the schema.`,
});

const emailTasksFlow = ai.defineFlow(
  {
    name: 'emailTasksFlow',
    inputSchema: EmailTasksInputSchema,
    outputSchema: EmailTasksOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      
      if (!output) {
        throw new Error('AI generated no output.');
      }

      return {
        ...output,
        success: true
      };
    } catch (error: any) {
      console.error('Email briefing generation error:', error);
      return {
        success: false,
        subject: "Your Daily Briefing",
        body: "We had a slight issue generating your AI briefing today, but don't let that stop you! Here's to a productive day."
      };
    }
  }
);

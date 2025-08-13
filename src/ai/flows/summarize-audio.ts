
'use server';

/**
 * @fileOverview Summarizes audio from WhatsApp messages.
 *
 * - summarizeAudio - A function that handles the audio summarization process.
 * - SummarizeAudioInput - The input type for the summarizeAudio function.
 * - SummarizeAudioOutput - The return type for the summarizeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getUserById } from '@/services/user-service';

const SummarizeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // As requested in the instructions.
    ),
    userId: z.string().describe('The ID of the user requesting the summary.'),
});
export type SummarizeAudioInput = z.infer<typeof SummarizeAudioInputSchema>;

const SummarizeAudioOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the audio content.'),
});
export type SummarizeAudioOutput = z.infer<typeof SummarizeAudioOutputSchema>;

export async function summarizeAudio(input: SummarizeAudioInput): Promise<SummarizeAudioOutput> {
  return summarizeAudioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAudioPrompt',
  input: {schema: SummarizeAudioInputSchema},
  output: {schema: SummarizeAudioOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing audio messages.

  Please provide a concise and informative summary of the audio content provided in the following data URI.  Make sure to identify the key topics discussed.

  Audio: {{media url=audioDataUri}}
  `,
});

const summarizeAudioFlow = ai.defineFlow(
  {
    name: 'summarizeAudioFlow',
    inputSchema: SummarizeAudioInputSchema,
    outputSchema: SummarizeAudioOutputSchema,
  },
  async (input) => {
    const user = await getUserById(input.userId);

    if (!user || user.status !== 'active') {
      throw new Error('User is not active or does not exist.');
    }
    
    // Check if subscription is expired (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (new Date(user.last_payment_at) < thirtyDaysAgo) {
        // Here you would also update the user's status to 'inactive' in a real app
        throw new Error('Subscription has expired. Please renew.');
    }

    const {output} = await prompt(input);
    return output!;
  }
);

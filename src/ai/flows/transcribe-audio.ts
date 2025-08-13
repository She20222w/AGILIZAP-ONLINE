
'use server';

/**
 * @fileOverview A WhatsApp audio transcription AI agent.
 *
 * - transcribeAudio - A function that handles the audio transcription process.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getUserById } from '@/services/user-service';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data URI of the WhatsApp message to transcribe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  userId: z.string().describe('The ID of the user requesting the transcription.'),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcription of the audio message.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: {schema: TranscribeAudioInputSchema},
  output: {schema: TranscribeAudioOutputSchema},
  prompt: `You are an expert transcriptionist specializing in transcribing audio messages.

  Transcribe the following audio message:

  {{media url=audioDataUri}}
  `,
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
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

    const {output} = await transcribeAudioPrompt(input);
    return output!;
  }
);

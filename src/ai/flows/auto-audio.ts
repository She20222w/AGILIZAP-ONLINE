'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getUserById, updateUserMinutes } from '@/services/user-service';
import { transcribeAudio } from './transcribe-audio';
import { summarizeAudio } from './summarize-audio';

const AutoAudioInputSchema = z.object({
  audioDataUri: z.string().describe('The audio data URI of the WhatsApp message.'),
  userId: z.string().describe('The ID of the user requesting the operation.'),
});
export type AutoAudioInput = z.infer<typeof AutoAudioInputSchema>;

const AutoAudioOutputSchema = z.object({
  result: z.string().describe('The result of the operation, either a transcription or a summary.'),
});
export type AutoAudioOutput = z.infer<typeof AutoAudioOutputSchema>;

export async function autoAudio(input: AutoAudioInput): Promise<AutoAudioOutput> {
  return autoAudioFlow(input);
}

const autoAudioFlow = ai.defineFlow(
  {
    name: 'autoAudioFlow',
    inputSchema: AutoAudioInputSchema,
    outputSchema: AutoAudioOutputSchema,
  },
  async (input) => {
    const user = await getUserById(input.userId);

    if (!user || user.status !== 'active') {
      throw new Error('User is not active or does not exist.');
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (!user.last_payment_at) {
      throw new Error('User has no payment date.');
    }
    if (new Date(user.last_payment_at) < thirtyDaysAgo) {
        throw new Error('Subscription has expired. Please renew.');
    }

    const transcriptionResult = await transcribeAudio(input);
    const wordCount = transcriptionResult.transcription.split(' ').length;

    if (wordCount > 40) {
      const summaryResult = await summarizeAudio(input);
      await updateUserMinutes(input.userId, user.minutes_used + 1);
      return { result: summaryResult.summary };
    } else {
      await updateUserMinutes(input.userId, user.minutes_used + 1);
      return { result: transcriptionResult.transcription };
    }
  }
);

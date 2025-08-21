
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
import { getUserById, updateUserMinutes } from '@/services/user-service';

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

    if (!user) {
      throw new Error('User does not exist.');
    }
    
    // Verifica se o usuário atingiu o limite de minutos do plano
    const planLimits: Record<string, number> = { pessoal: 200, business: 400, exclusivo: 1000 };
    const userPlan = user.plan as keyof typeof planLimits;
    const planLimitMinutes = userPlan ? planLimits[userPlan] : 0;
    const planLimitSeconds = planLimitMinutes * 60;
    
    if (user.minutes_used >= planLimitSeconds) {
      throw new Error('Você atingiu o limite de minutos do seu plano. Atualize seu plano para continuar usando o serviço.');
    }

    const {output} = await transcribeAudioPrompt(input);
    // Update minutes used (increment by 1)
    await updateUserMinutes(input.userId, user.minutes_used + 1);
    return output!;
  }
);

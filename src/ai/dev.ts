import { config } from 'dotenv';
config();

import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/summarize-audio.ts';
import '@/ai/flows/auto-audio.ts';

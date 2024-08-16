import { z } from 'zod';
import { Prediction } from 'replicate';

export const predictionRequestBodySchema = z.object({
  prompt: z.string(),
});

export type PredictionRequestBody = z.infer<typeof predictionRequestBodySchema>;

export const predictionResponseBodySchema = z.object({
  result: z.custom<Prediction>().optional(),
  error: z.string().optional(),
});

export type PredictionResponseBody = z.infer<typeof predictionResponseBodySchema>;

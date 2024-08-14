import { z } from 'zod';

export const predictionRequestBodySchema = z.object({
  prompt: z.string(),
});

export type PredictionRequestBody = z.infer<typeof predictionRequestBodySchema>;

export const predictionResponseBodySchema = z.object({
  result: z.string(),
  error: z.string().optional(),
});

export type PredictionResponseBody = z.infer<typeof predictionResponseBodySchema>;

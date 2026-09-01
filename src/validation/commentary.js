import { z } from 'zod';

// Schema validating optional query parameters for listing commentary
export const listCommentaryQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive('limit must be a positive integer')
    .max(100, 'limit cannot exceed 100')
    .optional(),
});

// Schema validating payload for creating commentary
export const createCommentarySchema = z.object({
  minute: z.coerce.number().int().min(0, 'minute must be non-negative').optional(),
  sequence: z.coerce.number().int().optional(),
  period: z.string().optional(),
  eventType: z.string().optional(),
  actor: z.string().optional(),
  team: z.string().optional(),
  message: z.string().min(1, 'message is required'),
  metadata: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

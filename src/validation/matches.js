import { z } from 'zod';

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

export const listMatchesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive('limit must be a positive integer')
    .max(100, 'limit cannot exceed 100')
    .optional(),
});

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive integer'),
});

const isoDateString = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid ISO date string',
});

export const createMatchSchema = z
  .object({
    sport: z.string().min(1, 'sport is required'),
    homeTeam: z.string().min(1, 'homeTeam is required'),
    awayTeam: z.string().min(1, 'awayTeam is required'),
    startTime: isoDateString,
    endTime: isoDateString,
    homeScore: z.coerce.number().int().min(0, 'homeScore must be non-negative').optional(),
    awayScore: z.coerce.number().int().min(0, 'awayScore must be non-negative').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime).getTime();
      const end = new Date(data.endTime).getTime();
      if (!isNaN(start) && !isNaN(end) && end <= start) {
        ctx.addIssue({
          code: 'custom',
          message: 'endTime must be chronologically after startTime',
          path: ['endTime'],
        });
      }
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0, 'homeScore must be non-negative'),
  awayScore: z.coerce.number().int().min(0, 'awayScore must be non-negative'),
});

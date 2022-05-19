import { z } from 'zod';

export const paginationValidation = {
  limit: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().max(1000)
  ),
  page: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number()),
};

import { z } from 'zod';
import {
   CREATOR_LIST_SORT_OPTIONS,
   CREATOR_LIST_SORT_ORDERS,
} from './creators.sort';
import { safeIntParam } from '../../utils/query.utils';
import {
   DEFAULT_PAGE_SIZE,
   DEFAULT_OFFSET,
   MIN_PAGE_SIZE,
   MAX_PAGE_SIZE,
} from '../../constants/pagination.constants';

/**
 * Validation schema for creator list query parameters.
 *
 * Validates pagination and filter params for GET /api/v1/creators endpoint.
 * Keeps query validation centralized and reusable across creator list handlers.
 *
 * @example
 * GET /api/v1/creators?limit=20&offset=0&sort=createdAt&order=desc&verified=true
 */
export const CreatorListQuerySchema = z.object({
   // Pagination
   limit: safeIntParam({
      defaultValue: DEFAULT_PAGE_SIZE,
      min: MIN_PAGE_SIZE,
      max: MAX_PAGE_SIZE,
      label: 'Limit',
   }),
   offset: safeIntParam({
      defaultValue: DEFAULT_OFFSET,
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
      label: 'Offset',
   }),

   // Sorting
   sort: z.enum(CREATOR_LIST_SORT_OPTIONS).optional().default('createdAt'),
   order: z.enum(CREATOR_LIST_SORT_ORDERS).optional().default('desc'),

   // Filters
   verified: z
      .string()
      .optional()
      .transform(val => {
         if (val === undefined) return undefined;
         return val === 'true';
      }),
   search: z.string().optional(),
});

export type CreatorListQueryType = z.infer<typeof CreatorListQuerySchema>;

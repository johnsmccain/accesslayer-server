// src/modules/creator/creator.controller.ts
import { Request, Response, RequestHandler } from 'express';
import { z } from 'zod';

// API response helpers
import {
  sendSuccess,
  sendError,
  sendValidationError,
  ErrorCode,
} from '../../utils/api-response.utils';

// Creator service and utilities
import { getPaginatedCreators } from './creator.service';
import { parseCreatorSortOptions } from './creator.utils';
import { safeIntParam } from '../../utils/query.utils';
import { parsePublicQuery } from '../../utils/public-query-parse.utils';
import { wrapPublicCreatorListResponse } from '../creators/public-creator-list-envelope.utils';
import { resolveCreatorListLimit } from '../creators/creators.limit.utils';
import { buildCreatorListRequestContext } from '../creators/creator-list-context.utils';
import { normalizeCreatorListPage } from './creator-list-page.guard';

// Pagination constants
import {
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../../constants/pagination.constants';
import { PUBLIC_PAGE_PAGINATION_DEFAULTS } from '../../utils/public-list-query-defaults';

// Legacy query schema
import { CreatorListQuerySchema as LegacyCreatorQuerySchema } from '../creators/creators.schemas';

// Typed Express handler
export const listCreators: RequestHandler = async (req, res) => {
  try {
    const ctx = buildCreatorListRequestContext(req);
    const parsed = parsePublicQuery(LegacyCreatorQuerySchema, ctx.query);

    if (!parsed.ok) {
      return sendValidationError(
        res,
        'Invalid query parameters',
        parsed.details
      );
    }

    // Destructure once
    let { page, limit, sortBy, sortOrder } = parsed.data;

    // Normalize page
    page = normalizeCreatorListPage(page);

    // Build sort options
    const sort = parseCreatorSortOptions(sortBy, sortOrder);

    // Fetch paginated creators
    const { creators, meta } = await getPaginatedCreators({
      page,
      limit,
      sort,
    });

    return sendSuccess(
      res,
      wrapPublicCreatorListResponse(creators, meta),
      200,
      'Creators retrieved successfully'
    );
  } catch (error) {
    console.error('Error listing creators:', error);
    return sendError(
      res,
      500,
      ErrorCode.INTERNAL_ERROR,
      'Failed to retrieve creators'
    );
  }
};

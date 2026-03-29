export async function listCreators(req: Request, res: Response) {
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
}

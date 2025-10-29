import { Types } from 'mongoose';

/**
 * Cursor-based pagination result
 */
export interface ICursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Build cursor-based pagination query
 * @param cursor - Last item's _id from previous page
 * @param baseQuery - Additional query conditions
 * @returns Query with cursor condition
 */
export const buildCursorQuery = (cursor: string | undefined, baseQuery: any = {}) => {
  const query = { ...baseQuery };

  if (cursor) {
    query._id = { $lt: new Types.ObjectId(cursor) };
  }

  return query;
};

/**
 * Format cursor-based pagination result
 * @param items - Items fetched from database (includes +1 extra item)
 * @param limit - Requested limit
 * @returns Formatted pagination result with nextCursor and hasMore
 */
export const formatCursorPaginationResult = <T extends { _id: any }>(
  items: T[],
  limit: number,
): ICursorPaginationResult<T> => {
  const hasMore = items.length > limit;
  const data = items.slice(0, limit);
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1]._id.toString() : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
};

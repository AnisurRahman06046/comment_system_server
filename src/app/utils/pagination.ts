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
 * Build cursor-based pagination query (simple _id cursor)
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
 * Build compound cursor query for sorting by non-_id fields
 * Supports descending sort with compound cursor (sortField + _id)
 * @param cursor - Cursor format: "fieldValue_id" (e.g., "50_652f...")
 * @param sortField - Field to sort by (e.g., "likesCount", "createdAt")
 * @param sortOrder - 1 for ascending, -1 for descending
 * @returns Aggregation match stage
 */
export const buildCompoundCursorQuery = (
  cursor: string | undefined,
  sortField: string,
  sortOrder: 1 | -1 = -1,
): any => {
  if (!cursor) {
    return {};
  }

  // Parse cursor: "fieldValue_id"
  const [fieldValueStr, cursorId] = cursor.split('_');

  // Convert field value to appropriate type
  let fieldValue: any;
  if (sortField === '_id') {
    fieldValue = cursorId;
  } else if (!isNaN(Number(fieldValueStr))) {
    fieldValue = Number(fieldValueStr);
  } else {
    fieldValue = new Date(fieldValueStr);
  }

  // Build compound query based on sort order
  if (sortOrder === -1) {
    // Descending: get items where (field < cursor.field) OR (field = cursor.field AND _id < cursor._id)
    return {
      $or: [
        { [sortField]: { $lt: fieldValue } },
        {
          $and: [
            { [sortField]: fieldValue },
            { _id: { $lt: new Types.ObjectId(cursorId) } },
          ],
        },
      ],
    };
  } else {
    // Ascending: get items where (field > cursor.field) OR (field = cursor.field AND _id > cursor._id)
    return {
      $or: [
        { [sortField]: { $gt: fieldValue } },
        {
          $and: [
            { [sortField]: fieldValue },
            { _id: { $gt: new Types.ObjectId(cursorId) } },
          ],
        },
      ],
    };
  }
};

/**
 * Build compound cursor string from item
 * @param item - Last item from current page
 * @param sortField - Field that was used for sorting
 * @returns Cursor string format: "fieldValue_id"
 */
export const buildCompoundCursor = (item: any, sortField: string): string => {
  const fieldValue = item[sortField];
  return `${fieldValue}_${item._id.toString()}`;
};

/**
 * Format cursor-based pagination result (simple _id cursor)
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

/**
 * Format cursor-based pagination result with compound cursor
 * @param items - Items fetched from database (includes +1 extra item)
 * @param limit - Requested limit
 * @param sortField - Field used for sorting
 * @returns Formatted pagination result with compound cursor
 */
export const formatCompoundCursorPaginationResult = <T extends { _id: any }>(
  items: T[],
  limit: number,
  sortField: string,
): ICursorPaginationResult<T> => {
  const hasMore = items.length > limit;
  const data = items.slice(0, limit);
  const nextCursor =
    hasMore && data.length > 0 ? buildCompoundCursor(data[data.length - 1], sortField) : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
};

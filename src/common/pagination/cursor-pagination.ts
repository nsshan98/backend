export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}

export class CursorPaginator {
  static buildResponse<T>(items: T[], limit: number): CursorPage<T> {
    if (items.length === 0) {
      return { data: [], nextCursor: null };
    }

    const lastItem = items[items.length - 1];

    return {
      data: items,
      nextCursor: lastItem.id ?? null,
    };
  }
}

import { db } from '../../db';
import { notes } from '../../db/schema';
import { desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const offset = (page - 1) * limit;

  const allNotes = await db.query.notes.findMany({
    orderBy: [desc(notes.updatedAt), desc(notes.createdAt)],
    limit,
    offset,
  });

  return {
    data: allNotes,
    meta: {
      page,
      limit,
      hasMore: allNotes.length === limit,
    },
  };
});

import { db } from '../../../db';
import { noteHistory } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateUUIDv7 } from '../../../utils/uuid';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Note ID is required',
    });
  }

  const history = await db.query.noteHistory.findMany({
    where: eq(noteHistory.noteId, id),
    orderBy: [desc(noteHistory.createdAt)],
    limit: 50,
  });

  return {
    data: history,
  };
});

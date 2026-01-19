import { db } from '../../db';
import { notes } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Note ID is required',
    });
  }

  const note = await db.query.notes.findFirst({
    where: eq(notes.id, id),
  });

  if (!note) {
    throw createError({
      statusCode: 404,
      message: 'Note not found',
    });
  }

  return {
    data: note,
  };
});

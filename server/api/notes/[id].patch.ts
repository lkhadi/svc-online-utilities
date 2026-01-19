import { db } from '../../db';
import { notes } from '../../db/schema';
import { eq } from 'drizzle-orm';

interface UpdateNoteBody {
  title?: string;
  content?: string;
}

export default defineEventHandler(async (event) => {
  const noteId = getRouterParam(event, 'id');
  
  if (!noteId) {
    throw createError({
      statusCode: 400,
      message: 'Note ID is required',
    });
  }

  const body = await readBody<UpdateNoteBody>(event);

  const existingNote = await db.query.notes.findFirst({
    where: eq(notes.id, noteId),
  });

  if (!existingNote) {
    throw createError({
      statusCode: 404,
      message: 'Note not found',
    });
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (body.title !== undefined) {
    updateData.title = body.title;
  }

  if (body.content !== undefined) {
    updateData.content = body.content;
  }

  const [updatedNote] = await db
    .update(notes)
    .set(updateData)
    .where(eq(notes.id, noteId))
    .returning();

  return { data: updatedNote };
});

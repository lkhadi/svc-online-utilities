import { db } from '../../db';
import { notes, noteHistory } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { generateUUIDv7 } from '../../utils/uuid';

interface UpdateNoteBody {
  content?: string;
  title?: string;
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody<UpdateNoteBody>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Note ID is required',
    });
  }

  const existingNote = await db.query.notes.findFirst({
    where: eq(notes.id, id),
  });

  if (!existingNote) {
    throw createError({
      statusCode: 404,
      message: 'Note not found',
    });
  }

  const updateData: Partial<typeof notes.$inferInsert> = {
    updatedAt: new Date(),
  };

  let contentChanged = false;
  let titleChanged = false;

  if (body.content !== undefined && body.content !== existingNote.content) {
    updateData.content = body.content;
    contentChanged = true;
  }

  if (body.title !== undefined && body.title !== existingNote.title) {
    updateData.title = body.title;
    titleChanged = true;
  }

  if (contentChanged || titleChanged) {
    await db.insert(noteHistory).values({
      id: generateUUIDv7(),
      noteId: id,
      content: existingNote.content,
      title: existingNote.title,
    });
  }

  const [updatedNote] = await db
    .update(notes)
    .set(updateData)
    .where(eq(notes.id, id))
    .returning();

  return {
    data: updatedNote,
  };
});

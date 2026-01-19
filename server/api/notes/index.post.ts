import { db } from '../../db';
import { notes, noteHistory } from '../../db/schema';
import { generateUUIDv7 } from '../../utils/uuid';

interface CreateNoteBody {
  content?: string;
  title?: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateNoteBody>(event);

  const [newNote] = await db
    .insert(notes)
    .values({
      id: generateUUIDv7(),
      content: body.content || '',
      title: body.title || 'Untitled',
    })
    .returning();

  return {
    data: newNote,
  };
});

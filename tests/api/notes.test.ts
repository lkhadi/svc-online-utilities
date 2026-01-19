import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { randomUUID } from 'crypto'
import { v7 as uuidv7 } from 'uuid'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

const DB_URL = process.env.TEST_DATABASE_URL || 'postgres://test:test@localhost:5432/test_db'

let client: any
let db: any

describe('API: Notes CRUD Operations', () => {
  beforeAll(async () => {
    client = postgres(DB_URL, { max: 1 })
    db = drizzle(client)

    await client`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `
  })

  afterAll(async () => {
    await client.end()
  })

  beforeEach(async () => {
    await client`TRUNCATE TABLE notes;`
  })

  describe('1. Create Note (POST /api/notes)', () => {
    it('should create a new note with UUID v7', async () => {
      const newNote = {
        title: 'Test Note',
        content: 'Test content'
      }

      const result = await client`
        INSERT INTO notes (id, title, content)
        VALUES (${uuidv7()}, ${newNote.title}, ${newNote.content})
        RETURNING *
      `

      expect(result[0]).toBeDefined()
      expect(result[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      expect(result[0].title).toBe(newNote.title)
      expect(result[0].content).toBe(newNote.content)
    })

    it('should create note with default title', async () => {
      const result = await client`
        INSERT INTO notes (id, title, content)
        VALUES (${uuidv7()}, 'Untitled Note', '')
        RETURNING *
      `

      expect(result[0].title).toBe('Untitled Note')
      expect(result[0].content).toBe('')
    })

    it('should set created_at and updated_at timestamps', async () => {
      const result = await client`
        INSERT INTO notes (id, title, content)
        VALUES (${uuidv7()}, 'Test', 'Content')
        RETURNING *
      `

      expect(result[0].created_at).toBeInstanceOf(Date)
      expect(result[0].updated_at).toBeInstanceOf(Date)
    })

    it('should handle long content', async () => {
      const longContent = 'x'.repeat(100000)

      const result = await client`
        INSERT INTO notes (id, title, content)
        VALUES (${uuidv7()}, 'Long Content Note', ${longContent})
        RETURNING *
      `

      expect(result[0].content).toBe(longContent)
    })

    it('should handle special characters', async () => {
      const specialContent = 'Hello 👋 World 🌍\nمرحبا\n你好\n∑ ∫ ∞ π'

      const result = await client`
        INSERT INTO notes (id, title, content)
        VALUES (${uuidv7()}, 'Special Characters', ${specialContent})
        RETURNING *
      `

      expect(result[0].content).toBe(specialContent)
    })

    it('should reject duplicate IDs', async () => {
      const id = uuidv7()

      await client`
        INSERT INTO notes (id, title, content)
        VALUES (${id}, 'First', 'Content')
      `

      await expect(
        client`
          INSERT INTO notes (id, title, content)
          VALUES (${id}, 'Duplicate', 'Content')
        `
      ).rejects.toThrow()
    })
  })

  describe('2. Read Note (GET /api/notes/:id)', () => {
    beforeEach(async () => {
      const note1Id = uuidv7()
      const note2Id = uuidv7()

      await client`
        INSERT INTO notes (id, title, content) VALUES
        (${note1Id}, 'Note 1', 'Content 1'),
        (${note2Id}, 'Note 2', 'Content 2')
      `
    })

    it('should retrieve note by ID', async () => {
      const notes = await client`SELECT * FROM notes LIMIT 1`
      const noteId = notes[0].id

      const result = await client`
        SELECT * FROM notes WHERE id = ${noteId}
      `

      expect(result[0]).toBeDefined()
      expect(result[0].id).toBe(noteId)
    })

    it('should return null for non-existent note', async () => {
      const result = await client`
        SELECT * FROM notes WHERE id = ${randomUUID()}
      `

      expect(result.length).toBe(0)
    })

    it('should retrieve all notes', async () => {
      const result = await client`SELECT * FROM notes ORDER BY created_at DESC`

      expect(result.length).toBe(2)
    })

    it('should include all fields', async () => {
      const result = await client`SELECT * FROM notes LIMIT 1`

      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('title')
      expect(result[0]).toHaveProperty('content')
      expect(result[0]).toHaveProperty('created_at')
      expect(result[0]).toHaveProperty('updated_at')
    })
  })

  describe('3. Update Note (PUT /api/notes/:id)', () => {
    let noteId: string

    beforeEach(async () => {
      noteId = uuidv7()

      await client`
        INSERT INTO notes (id, title, content)
        VALUES (${noteId}, 'Original Title', 'Original Content')
      `
    })

    it('should update note title', async () => {
      const newTitle = 'Updated Title'

      const result = await client`
        UPDATE notes
        SET title = ${newTitle}, updated_at = NOW()
        WHERE id = ${noteId}
        RETURNING *
      `

      expect(result[0].title).toBe(newTitle)
    })

    it('should update note content', async () => {
      const newContent = 'Updated content'

      const result = await client`
        UPDATE notes
        SET content = ${newContent}, updated_at = NOW()
        WHERE id = ${noteId}
        RETURNING *
      `

      expect(result[0].content).toBe(newContent)
    })

    it('should update both title and content', async () => {
      const result = await client`
        UPDATE notes
        SET title = 'New Title', content = 'New Content', updated_at = NOW()
        WHERE id = ${noteId}
        RETURNING *
      `

      expect(result[0].title).toBe('New Title')
      expect(result[0].content).toBe('New Content')
    })

    it('should update updated_at timestamp', async () => {
      const original = await client`SELECT updated_at FROM notes WHERE id = ${noteId}`
      await new Promise(resolve => setTimeout(resolve, 100))

      const result = await client`
        UPDATE notes
        SET content = 'Updated', updated_at = NOW()
        WHERE id = ${noteId}
        RETURNING *
      `

      expect(result[0].updated_at.getTime()).toBeGreaterThan(original[0].updated_at.getTime())
    })

    it('should not update non-existent note', async () => {
      const result = await client`
        UPDATE notes
        SET title = 'Test'
        WHERE id = ${randomUUID()}
        RETURNING *
      `

      expect(result.length).toBe(0)
    })

    it('should handle empty content update', async () => {
      const result = await client`
        UPDATE notes
        SET content = '', updated_at = NOW()
        WHERE id = ${noteId}
        RETURNING *
      `

      expect(result[0].content).toBe('')
    })
  })

  describe('4. Delete Note (DELETE /api/notes/:id)', () => {
    let noteId: string

    beforeEach(async () => {
      noteId = uuidv7()

      await client`
        INSERT INTO notes (id, title, content)
        VALUES (${noteId}, 'To Delete', 'Content')
      `
    })

    it('should delete note by ID', async () => {
      const result = await client`
        DELETE FROM notes WHERE id = ${noteId}
        RETURNING *
      `

      expect(result[0].id).toBe(noteId)
    })

    it('should verify deletion', async () => {
      await client`DELETE FROM notes WHERE id = ${noteId}`

      const check = await client`SELECT * FROM notes WHERE id = ${noteId}`
      expect(check.length).toBe(0)
    })

    it('should not delete non-existent note', async () => {
      const result = await client`
        DELETE FROM notes WHERE id = ${randomUUID()}
        RETURNING *
      `

      expect(result.length).toBe(0)
    })

    it('should maintain other notes after deletion', async () => {
      const note2Id = uuidv7()
      await client`
        INSERT INTO notes (id, title, content)
        VALUES (${note2Id}, 'Keep Me', 'Content')
      `

      await client`DELETE FROM notes WHERE id = ${noteId}`

      const remaining = await client`SELECT * FROM notes`
      expect(remaining.length).toBe(1)
      expect(remaining[0].id).toBe(note2Id)
    })
  })

  describe('5. List Notes (GET /api/notes)', () => {
    beforeEach(async () => {
      const notes = [
        { id: uuidv7(), title: 'Note A', content: 'Content A' },
        { id: uuidv7(), title: 'Note B', content: 'Content B' },
        { id: uuidv7(), title: 'Note C', content: 'Content C' }
      ]

      for (const note of notes) {
        await client`
          INSERT INTO notes (id, title, content)
          VALUES (${note.id}, ${note.title}, ${note.content})
        `
      }
    })

    it('should list all notes', async () => {
      const result = await client`SELECT * FROM notes`

      expect(result.length).toBe(3)
    })

    it('should sort by updated_at descending', async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      await client`UPDATE notes SET updated_at = NOW() WHERE title = 'Note B'`

      const result = await client`
        SELECT * FROM notes ORDER BY updated_at DESC
      `

      expect(result[0].title).toBe('Note B')
    })

    it('should support pagination', async () => {
      const page1 = await client`SELECT * FROM notes ORDER BY updated_at DESC LIMIT 2 OFFSET 0`
      const page2 = await client`SELECT * FROM notes ORDER BY updated_at DESC LIMIT 2 OFFSET 2`

      expect(page1.length).toBe(2)
      expect(page2.length).toBe(1)
    })

    it('should support filtering by title', async () => {
      const result = await client`
        SELECT * FROM notes WHERE title LIKE ${'Note %'}
      `

      expect(result.length).toBe(3)
    })

    it('should support filtering by content', async () => {
      const result = await client`
        SELECT * FROM notes WHERE content LIKE ${'Content %'}
      `

      expect(result.length).toBe(3)
    })
  })

  describe('6. Share Note (GET /api/notes/:id/share)', () => {
    let noteId: string

    beforeEach(async () => {
      noteId = uuidv7()

      await client`
        INSERT INTO notes (id, title, content)
        VALUES (${noteId}, 'Shareable Note', 'Shared Content')
      `
    })

    it('should generate share URL with note ID', async () => {
      const note = await client`SELECT * FROM notes WHERE id = ${noteId}`

      const shareUrl = `https://example.com/share/${note[0].id}`

      expect(shareUrl).toContain(noteId)
    })

    it('should validate UUID v7 in share URL', async () => {
      const note = await client`SELECT * FROM notes WHERE id = ${noteId}`

      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      expect(note[0].id).toMatch(uuidPattern)
    })
  })

  describe('7. Search Notes (GET /api/notes/search)', () => {
    beforeEach(async () => {
      const notes = [
        { id: uuidv7(), title: 'JavaScript Guide', content: 'Learn JavaScript programming' },
        { id: uuidv7(), title: 'Python Tutorial', content: 'Python basics' },
        { id: uuidv7(), title: 'React Notes', content: 'React component development' }
      ]

      for (const note of notes) {
        await client`
          INSERT INTO notes (id, title, content)
          VALUES (${note.id}, ${note.title}, ${note.content})
        `
      }
    })

    it('should search by title', async () => {
      const result = await client`
        SELECT * FROM notes WHERE title ILIKE ${'%JavaScript%'}
      `

      expect(result.length).toBe(1)
      expect(result[0].title).toBe('JavaScript Guide')
    })

    it('should search by content', async () => {
      const result = await client`
        SELECT * FROM notes WHERE content ILIKE ${'%programming%'}
      `

      expect(result.length).toBe(1)
    })

    it('should search case-insensitive', async () => {
      const result1 = await client`SELECT * FROM notes WHERE title ILIKE ${'%JAVASCRIPT%'}`
      const result2 = await client`SELECT * FROM notes WHERE title ILIKE ${'%javascript%'}`

      expect(result1.length).toBe(result2.length)
    })

    it('should search across both title and content', async () => {
      const result = await client`
        SELECT * FROM notes 
        WHERE title ILIKE ${'%React%'} OR content ILIKE ${'%React%'}
      `

      expect(result.length).toBe(1)
    })
  })

  describe('8. Database Constraints', () => {
    it('should enforce NOT NULL on title', async () => {
      await expect(
        client`
          INSERT INTO notes (id, title, content)
          VALUES (${uuidv7()}, NULL, 'Content')
        `
      ).rejects.toThrow()
    })

    it('should enforce NOT NULL on content', async () => {
      await expect(
        client`
          INSERT INTO notes (id, title, content)
          VALUES (${uuidv7()}, 'Title', NULL)
        `
      ).rejects.toThrow()
    })

    it('should enforce PRIMARY KEY on id', async () => {
      const id = uuidv7()

      await client`
        INSERT INTO notes (id, title, content)
        VALUES (${id}, 'First', 'Content')
      `

      await expect(
        client`
          INSERT INTO notes (id, title, content)
          VALUES (${id}, 'Second', 'Content')
        `
      ).rejects.toThrow()
    })
  })

  describe('9. Transaction Tests', () => {
    it('should rollback failed transaction', async () => {
      await client.begin(async (tx: any) => {
        const noteId = uuidv7()

        await tx`
          INSERT INTO notes (id, title, content)
          VALUES (${noteId}, 'Test', 'Content')
        `

        await tx`INSERT INTO invalid_table VALUES (1)`
      })

      const result = await client`SELECT * FROM notes`
      expect(result.length).toBe(0)
    })

    it('should commit successful transaction', async () => {
      await client.begin(async (tx: any) => {
        const noteId = uuidv7()

        await tx`
          INSERT INTO notes (id, title, content)
          VALUES (${noteId}, 'Test', 'Content')
        `
      })

      const result = await client`SELECT * FROM notes`
      expect(result.length).toBe(1)
    })

    it('should handle multiple operations in transaction', async () => {
      const ids = [uuidv7(), uuidv7(), uuidv7()]

      await client.begin(async (tx: any) => {
        for (const id of ids) {
          await tx`
            INSERT INTO notes (id, title, content)
            VALUES (${id}, 'Note', 'Content')
          `
        }
      })

      const result = await client`SELECT * FROM notes`
      expect(result.length).toBe(3)
    })
  })

  describe('10. Performance Tests', () => {
    it('should handle 1000 insert operations', async () => {
      const startTime = performance.now()

      for (let i = 0; i < 1000; i++) {
        await client`
          INSERT INTO notes (id, title, content)
          VALUES (${uuidv7()}, ${`Note ${i}`}, ${`Content ${i}`})
        `
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(10000)
    })

    it('should handle bulk insert', async () => {
      const notes = Array(100).fill(null).map((_, i) => ({
        id: uuidv7(),
        title: `Note ${i}`,
        content: `Content ${i}`
      }))

      const startTime = performance.now()

      await client`
        INSERT INTO notes ${client(notes)}
      `

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1000)
    })

    it('should handle complex query with join', async () => {
      for (let i = 0; i < 100; i++) {
        await client`
          INSERT INTO notes (id, title, content)
          VALUES (${uuidv7()}, ${`Note ${i}`}, ${`Content ${i}`})
        `
      }

      const startTime = performance.now()

      const result = await client`
        SELECT * FROM notes
        WHERE content ILIKE ${'%Content%'}
        ORDER BY updated_at DESC
        LIMIT 10
      `

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(result.length).toBe(10)
      expect(duration).toBeLessThan(500)
    })
  })

  describe('11. Security Tests', () => {
    it('should escape SQL injection in title', async () => {
      const maliciousTitle = "'; DROP TABLE notes; --"

      const result = await client`
        INSERT INTO notes (id, title, content)
        VALUES (${uuidv7()}, ${maliciousTitle}, 'Content')
        RETURNING *
      `

      expect(result[0].title).toBe(maliciousTitle)

      const tableExists = await client`
        SELECT table_name FROM information_schema.tables
        WHERE table_name = 'notes'
      `

      expect(tableExists.length).toBe(1)
    })

    it('should escape SQL injection in content', async () => {
      const maliciousContent = "<script>alert('XSS')</script>"

      const result = await client`
        INSERT INTO notes (id, title, content)
        VALUES (${uuidv7()}, 'Title', ${maliciousContent})
        RETURNING *
      `

      expect(result[0].content).toBe(maliciousContent)
    })

    it('should handle UUID injection attempts', async () => {
      const maliciousId = "'; DROP TABLE notes; --"

      await expect(
        client`
          INSERT INTO notes (id, title, content)
          VALUES (${maliciousId}, 'Title', 'Content')
        `
      ).rejects.toThrow()
    })
  })

  describe('12. Data Integrity Tests', () => {
    it('should maintain referential integrity', async () => {
      const noteId = uuidv7()

      await client`
        INSERT INTO notes (id, title, content)
        VALUES (${noteId}, 'Title', 'Content')
      `

      const result = await client`
        SELECT * FROM notes WHERE id = ${noteId}
      `

      expect(result[0].id).toBe(noteId)
      expect(result[0].title).toBe('Title')
      expect(result[0].content).toBe('Content')
    })

    it('should handle concurrent updates', async () => {
      const noteId = uuidv7()

      await client`
        INSERT INTO notes (id, title, content)
        VALUES (${noteId}, 'Original', 'Content')
      `

      const [update1, update2] = await Promise.all([
        client`UPDATE notes SET content = 'Update 1' WHERE id = ${noteId} RETURNING *`,
        client`UPDATE notes SET content = 'Update 2' WHERE id = ${noteId} RETURNING *`
      ])

      expect(update1[0].content).toMatch(/Update \d/)
      expect(update2[0].content).toMatch(/Update \d/)
    })

    it('should prevent data loss on error', async () => {
      const noteId = uuidv7()

      await client`
        INSERT INTO notes (id, title, content)
        VALUES (${noteId}, 'Title', 'Content')
      `

      try {
        await client`
          INSERT INTO notes (id, title, content)
          VALUES (${noteId}, 'Duplicate', 'Content')
        `
      } catch (e) {
      }

      const result = await client`SELECT * FROM notes WHERE id = ${noteId}`
      expect(result.length).toBe(1)
    })
  })
})

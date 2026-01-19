# Online Notepad Testing Documentation

## Test Suite Overview

This document provides comprehensive test coverage for the Online Notepad tool, ensuring reliability, performance, and user experience.

## Test Files

1. **Component Tests**: `app/components/__tests__/OnlineNotepad.test.ts`
2. **API Tests**: `tests/api/notes.test.ts`
3. **Testing Report**: `TESTING_REPORT_ONLINE_NOTEPAD.md`
4. **Manual Testing Checklist**: `MANUAL_CHECKLIST_ONLINE_NOTEPAD.md`

## Test Coverage Areas

### 1. Create New Notes

**Unit Tests:**
- ✅ Create a new note with default title
- ✅ Create a new note with unique ID
- ✅ Generate UUID v7 for new notes
- ✅ Add new note to notes list
- ✅ Set new note as active
- ✅ Create multiple notes

**Expected Results:**
- New notes are created with title "Untitled Note"
- Each note receives a unique UUID v7 identifier
- Notes are added to the notes array
- The newly created note becomes the active note

### 2. Edit Existing Notes

**Unit Tests:**
- ✅ Update note content on edit
- ✅ Update note title
- ✅ Update timestamp on content edit
- ✅ Maintain note ID after edit
- ✅ Update note in notes list

**Expected Results:**
- Content changes are reflected immediately
- Title changes are reflected immediately
- Updated timestamp changes on each modification
- Note ID remains constant throughout edits
- Changes propagate to the notes list

### 3. Auto-Save Functionality

**Unit Tests:**
- ✅ Debounce auto-save
- ✅ Save after debounce timeout
- ✅ Clear previous debounce timer
- ✅ Show save indicator
- ✅ Not save if content unchanged

**Expected Results:**
- Auto-save triggers 500ms after last edit
- Rapid edits only trigger one save
- Save indicator shows during save operation
- No redundant saves for identical content

### 4. Delete Notes

**Unit Tests:**
- ✅ Delete active note
- ✅ Select another note after deletion
- ✅ Handle deletion of last note
- ✅ Confirm before deletion
- ✅ Handle delete cancellation

**Expected Results:**
- Note is removed from notes list
- Another note becomes active (if available)
- Last note deletion clears current note
- Confirmation dialog appears
- Cancellation preserves note

### 5. Rename Notes

**Unit Tests:**
- ✅ Rename note successfully
- ✅ Update title in notes list
- ✅ Handle empty title
- ✅ Handle whitespace-only title
- ✅ Update timestamp on rename
- ✅ Handle very long titles

**Expected Results:**
- Title updates immediately
- Changes reflect in notes list
- Empty titles default to "Untitled Note"
- Whitespace titles default to "Untitled Note"
- Timestamp updates on rename
- Long titles (up to 1000 chars) supported

### 6. Sharing via UUID v7 URL

**Unit Tests:**
- ✅ Generate shareable URL with UUID v7
- ✅ Include note ID in share URL
- ✅ Include base URL
- ✅ Use /share/ path
- ✅ Generate unique URLs for different notes

**Expected Results:**
- Shareable URL contains valid UUID v7
- URL format: `https://domain.com/share/{uuid-v7}`
- Each note generates unique share URL
- URLs are persistent and stable

### 7. Copy URL to Clipboard

**Unit Tests:**
- ✅ Copy URL to clipboard
- ✅ Show success message after copy
- ✅ Hide success message after 2 seconds
- ✅ Handle clipboard errors gracefully
- ✅ Fallback to execCommand if clipboard API unavailable

**Expected Results:**
- URL copied to system clipboard
- Success message appears briefly
- Error handling prevents app crashes
- Fallback method for older browsers

### 8. Very Long Text Content

**Unit Tests:**
- ✅ Handle 10,000 character content
- ✅ Handle 100,000 character content
- ✅ Handle 1,000,000 character content
- ✅ Auto-save long content
- ✅ Count words in long content
- ✅ Count characters in long content

**Expected Results:**
- Content up to 1MB supported
- Performance remains acceptable (< 5s)
- Auto-save works for long content
- Word count accurate for large texts
- Character count accurate for large texts

### 9. Special Characters and Unicode

**Unit Tests:**
- ✅ Handle emojis
- ✅ Handle Chinese characters
- ✅ Handle Arabic characters
- ✅ Handle Hebrew characters
- ✅ Handle mathematical symbols
- ✅ Handle currency symbols
- ✅ Handle special HTML entities
- ✅ Handle zero-width characters
- ✅ Handle right-to-left text
- ✅ Handle mixed LTR and RTL

**Expected Results:**
- All Unicode characters properly stored
- Emojis display correctly
- RTL languages render correctly
- Mixed LTR/RTL text handled
- Special entities preserved

### 10. Empty Notes

**Unit Tests:**
- ✅ Create empty note
- ✅ Allow saving empty note
- ✅ Set default title for empty note
- ✅ Show 0 word count for empty note
- ✅ Show 0 character count for empty note
- ✅ Handle clearing note content
- ✅ Handle whitespace-only note

**Expected Results:**
- Empty notes are valid
- Default title applied
- Counts show 0
- Whitespace notes count as empty

### 11. Word/Character Count

**Unit Tests:**
- ✅ Count words correctly
- ✅ Count characters correctly
- ✅ Count words with punctuation
- ✅ Count newlines in character count
- ✅ Count tabs in character count
- ✅ Update word count on input
- ✅ Handle multiple spaces
- ✅ Count unicode characters correctly
- ✅ Count combined emoji as one word

**Expected Results:**
- Word count accurate (whitespace delimited)
- Character count includes all characters
- Punctuation handled correctly
- Newlines and tabs counted
- Real-time count updates
- Unicode handled correctly

### 12. Note List/History

**Unit Tests:**
- ✅ Display all notes
- ✅ Sort notes by updated date descending
- ✅ Select note from list
- ✅ Show note preview in list
- ✅ Limit preview length
- ✅ Show note timestamps
- ✅ Highlight active note in list
- ✅ Persist notes to localStorage
- ✅ Load notes from localStorage

**Expected Results:**
- All notes displayed in sidebar
- Recently updated notes first
- Clicking note switches view
- Preview shows first 100 chars
- Timestamps displayed
- Active note highlighted
- Notes persisted to localStorage
- Notes loaded from localStorage on startup

### 13. Full-Screen Mode

**Unit Tests:**
- ✅ Enter full-screen mode
- ✅ Exit full-screen mode
- ✅ Detect full-screen change
- ✅ Handle full-screen API unavailable
- ✅ Toggle with keyboard shortcut

**Expected Results:**
- Full-screen mode activates on request
- Exit button or ESC exits full-screen
- Full-screen state tracked
- Graceful degradation if API unavailable
- Ctrl/Cmd + F toggles full-screen

### 14. Concurrent Edits

**Unit Tests:**
- ✅ Handle rapid consecutive edits
- ✅ Debounce saves during rapid edits
- ✅ Save only last edit after debounce
- ✅ Handle multiple note edits
- ✅ Prevent data loss during rapid edits

**Expected Results:**
- Rapid edits only trigger one save
- Last edit content preserved
- Multiple notes can be edited
- No data loss during concurrent edits
- Debounce timer resets on each edit

### 15. Database Operations

**Unit Tests:**
- ✅ Save note to database
- ✅ Load note from database
- ✅ Handle database save errors
- ✅ Handle database load errors
- ✅ Sync notes to localStorage as backup
- ✅ Merge database and localStorage on load

**Expected Results:**
- Notes saved to PostgreSQL via Drizzle ORM
- Notes loaded from database on demand
- Errors logged and handled gracefully
- localStorage serves as backup
- Both sources merged for data recovery

## API Route Tests

### Endpoints Tested

1. **POST /api/notes** - Create new note
2. **GET /api/notes/:id** - Get note by ID
3. **PUT /api/notes/:id** - Update note
4. **DELETE /api/notes/:id** - Delete note
5. **GET /api/notes** - List all notes
6. **GET /api/notes/:id/share** - Generate share URL
7. **GET /api/notes/search** - Search notes

### Database Tests

**Constraints:**
- ✅ PRIMARY KEY on id
- ✅ NOT NULL on title
- ✅ NOT NULL on content
- ✅ UNIQUE constraint on id

**Operations:**
- ✅ INSERT - Create notes
- ✅ SELECT - Read notes
- ✅ UPDATE - Modify notes
- ✅ DELETE - Remove notes
- ✅ Transactions - Multiple operations
- ✅ Bulk operations - Efficient inserts

**Performance:**
- ✅ 1000 inserts in < 10s
- ✅ Bulk insert 100 notes in < 1s
- ✅ Complex queries < 500ms

**Security:**
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ UUID validation
- ✅ Input sanitization

**Data Integrity:**
- ✅ Referential integrity
- ✅ Concurrent updates
- ✅ Data loss prevention
- ✅ Rollback on errors

## Manual Testing Checklist

See `MANUAL_CHECKLIST_ONLINE_NOTEPAD.md` for detailed manual testing procedures.

## Test Execution

```bash
# Run all tests
npm test

# Run component tests
npm test -- app/components/__tests__/OnlineNotepad.test.ts

# Run API tests
npm test -- tests/api/notes.test.ts

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

## Test Results Summary

| Category | Tests | Passed | Failed | Coverage |
|----------|-------|--------|--------|----------|
| Component Tests | 150+ | TBD | TBD | TBD |
| API Tests | 60+ | TBD | TBD | TBD |
| Manual Tests | 30 | TBD | TBD | N/A |

## Known Limitations

1. Concurrent edits from multiple users not tested (requires WebSocket)
2. Real-time synchronization not implemented
3. Offline functionality not fully tested
4. Mobile browser testing requires manual verification

## Dependencies

- **Vitest** - Test runner
- **@vue/test-utils** - Vue component testing
- **@testing-library/jest-dom** - DOM assertions
- **jsdom** - DOM environment for Node
- **Drizzle ORM** - Database testing
- **PostgreSQL** - Database for integration tests

## Future Enhancements

1. Add WebSocket integration tests
2. Add offline mode testing
3. Add E2E tests with Playwright/Cypress
4. Add accessibility testing (axe-core)
5. Add performance benchmarking
6. Add load testing with k6

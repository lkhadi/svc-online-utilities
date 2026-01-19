# Online Notepad Manual Testing Checklist

## Prerequisites

- ✅ Browser: Chrome, Firefox, Safari, Edge
- ✅ Device: Desktop, Tablet, Mobile
- ✅ Network: Online, Offline
- ✅ Database: PostgreSQL connection

## 1. Create New Notes

### Test Case 1.1: Create Empty Note
- [ ] Click "New Note" button
- [ ] Verify new note appears in sidebar
- [ ] Verify title is "Untitled Note"
- [ ] Verify content area is empty
- [ ] Verify note is marked as active

### Test Case 1.2: Create Multiple Notes
- [ ] Create 5 new notes in succession
- [ ] Verify all 5 appear in sidebar
- [ ] Verify each has unique UUID
- [ ] Verify last created is active

### Test Case 1.3: Create Note with Initial Content
- [ ] Click "New Note"
- [ ] Type "Hello World"
- [ ] Verify content displays
- [ ] Verify auto-save triggers

## 2. Edit Existing Notes

### Test Case 2.1: Edit Note Content
- [ ] Select existing note
- [ ] Type "New content"
- [ ] Verify content updates immediately
- [ ] Verify word count updates

### Test Case 2.2: Edit Note Title
- [ ] Double-click note title
- [ ] Type "New Title"
- [ ] Press Enter
- [ ] Verify title updated in sidebar
- [ ] Verify title updated in header

### Test Case 2.3: Edit Large Content
- [ ] Paste 10,000 characters
- [ ] Verify editor remains responsive
- [ ] Verify scroll works correctly
- [ ] Verify auto-save still works

### Test Case 2.4: Edit with Unicode
- [ ] Type emojis: 👋🌍🎉
- [ ] Type Chinese: 你好世界
- [ ] Type Arabic: مرحبا
- [ ] Verify all characters display correctly

## 3. Auto-Save Functionality

### Test Case 3.1: Auto-Save Triggers
- [ ] Type content
- [ ] Wait 2 seconds
- [ ] Verify save indicator shows
- [ ] Verify save indicator disappears

### Test Case 3.2: Auto-Save Debounce
- [ ] Type "A"
- [ ] Wait 100ms
- [ ] Type "B"
- [ ] Wait 100ms
- [ ] Type "C"
- [ ] Wait 500ms
- [ ] Verify only one save occurred

### Test Case 3.3: Auto-Save Indicator
- [ ] Verify "Saving..." appears during save
- [ ] Verify "Saved" appears after save
- [ ] Verify indicator is not intrusive

### Test Case 3.4: Auto-Save on Close
- [ ] Edit content
- [ ] Close tab immediately
- [ ] Reopen tab
- [ ] Verify content saved

## 4. Delete Notes

### Test Case 4.1: Delete Active Note
- [ ] Select a note
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] Verify note removed from sidebar
- [ ] Verify another note becomes active

### Test Case 4.2: Delete Inactive Note
- [ ] Right-click note in sidebar
- [ ] Click "Delete"
- [ ] Confirm deletion
- [ ] Verify note removed
- [ ] Verify active note unchanged

### Test Case 4.3: Delete Last Note
- [ ] Delete all notes except one
- [ ] Delete last note
- [ ] Verify empty state shows
- [ ] Verify "New Note" button available

### Test Case 4.4: Cancel Deletion
- [ ] Click delete button
- [ ] Click "Cancel" in confirmation
- [ ] Verify note still exists

### Test Case 4.5: Delete Multiple Notes
- [ ] Select multiple notes (if supported)
- [ ] Click delete
- [ ] Verify all selected removed

## 5. Rename Notes

### Test Case 5.1: Rename via Double-Click
- [ ] Double-click note title
- [ ] Type "New Name"
- [ ] Press Enter
- [ ] Verify title updated

### Test Case 5.2: Rename via Menu
- [ ] Right-click note
- [ ] Select "Rename"
- [ ] Type "New Name"
- [ ] Confirm
- [ ] Verify title updated

### Test Case 5.3: Empty Title
- [ ] Rename note to empty string
- [ ] Verify title becomes "Untitled Note"

### Test Case 5.4: Whitespace Title
- [ ] Rename note to spaces
- [ ] Verify title becomes "Untitled Note"

### Test Case 5.5: Long Title
- [ ] Rename to 100 characters
- [ ] Verify title displays
- [ ] Rename to 1000 characters
- [ ] Verify title displays (maybe truncated)

## 6. Sharing via UUID v7 URL

### Test Case 6.1: Generate Share URL
- [ ] Click "Share" button
- [ ] Verify URL contains UUID v7
- [ ] Verify URL format: /share/{uuid}

### Test Case 6.2: Copy URL
- [ ] Click "Copy URL"
- [ ] Verify success message
- [ ] Paste into notepad
- [ ] Verify URL is correct

### Test Case 6.3: Open Shared Link
- [ ] Copy share URL
- [ ] Open in new tab (incognito)
- [ ] Verify note loads
- [ ] Verify content is read-only (or editable)

### Test Case 6.4: Unique URLs
- [ ] Generate URL for Note A
- [ ] Generate URL for Note B
- [ ] Verify URLs are different

## 7. Copy URL to Clipboard

### Test Case 7.1: Copy Success
- [ ] Click "Copy" button
- [ ] Verify success message shows
- [ ] Verify clipboard contains URL

### Test Case 7.2: Copy Without Permission
- [ ] Test in browser without clipboard permission
- [ ] Verify fallback method works

### Test Case 7.3: Success Message Duration
- [ ] Copy URL
- [ ] Verify message shows
- [ ] Wait 2 seconds
- [ ] Verify message disappears

## 8. Very Long Text Content

### Test Case 8.1: 10,000 Characters
- [ ] Paste 10,000 chars
- [ ] Verify editor responds quickly
- [ ] Verify scrolling works
- [ ] Verify auto-save works

### Test Case 8.2: 100,000 Characters
- [ ] Paste 100,000 chars
- [ ] Verify editor responds (< 2s)
- [ ] Verify scroll works
- [ ] Verify memory usage is reasonable

### Test Case 8.3: 1,000,000 Characters
- [ ] Paste 1,000,000 chars
- [ ] Verify editor responds (< 5s)
- [ ] Verify no crash
- [ ] Verify auto-save works

### Test Case 8.4: Word Count on Large Text
- [ ] Load 100,000 character note
- [ ] Verify word count is accurate
- [ ] Verify count updates on edit

## 9. Special Characters and Unicode

### Test Case 9.1: Emojis
- [ ] Type: 👋🌍🎉🚀❤️
- [ ] Verify all emojis display

### Test Case 9.2: Chinese
- [ ] Type: 你好世界
- [ ] Verify Chinese displays correctly

### Test Case 9.3: Japanese
- [ ] Type: こんにちは世界
- [ ] Verify Japanese displays correctly

### Test Case 9.4: Korean
- [ ] Type: 안녕하세요 세계
- [ ] Verify Korean displays correctly

### Test Case 9.5: Arabic
- [ ] Type: مرحبا بالعالم
- [ ] Verify Arabic displays correctly (RTL)

### Test Case 9.6: Hebrew
- [ ] Type: שלום עולם
- [ ] Verify Hebrew displays correctly (RTL)

### Test Case 9.7: Mathematical Symbols
- [ ] Type: ∑ ∫ ∞ π √ ≠ ≤ ≥
- [ ] Verify symbols display

### Test Case 9.8: Currency Symbols
- [ ] Type: $ € £ ¥ ₩ ₹
- [ ] Verify symbols display

### Test Case 9.9: Mixed Script
- [ ] Type: Hello 你好 مرحبا שלום
- [ ] Verify all display correctly

## 10. Empty Notes

### Test Case 10.1: Create Empty Note
- [ ] Click "New Note"
- [ ] Verify note created
- [ ] Verify content is empty

### Test Case 10.2: Save Empty Note
- [ ] Create empty note
- [ ] Click save (if manual save)
- [ ] Verify note persists

### Test Case 10.3: Clear Note Content
- [ ] Create note with content
- [ ] Select all and delete
- [ ] Verify note becomes empty
- [ ] Verify auto-save works

### Test Case 10.4: Whitespace Only
- [ ] Type spaces and newlines
- [ ] Verify word count is 0
- [ ] Verify character count excludes trailing spaces (maybe)

## 11. Word/Character Count

### Test Case 11.1: Basic Word Count
- [ ] Type: "Hello world"
- [ ] Verify count: 2

### Test Case 11.2: Punctuation
- [ ] Type: "Hello, world! How are you?"
- [ ] Verify count: 5

### Test Case 11.3: Multiple Spaces
- [ ] Type: "Word1   Word2"
- [ ] Verify count: 2

### Test Case 11.4: Newlines
- [ ] Type: "Line 1\nLine 2"
- [ ] Verify word count: 2
- [ ] Verify character count includes newline

### Test Case 11.5: Unicode Words
- [ ] Type: "你好 世界"
- [ ] Verify count: 2

### Test Case 11.6: Real-time Updates
- [ ] Type character by character
- [ ] Verify count updates each time

### Test Case 11.7: Combined Emojis
- [ ] Type: "👨‍👩‍👧‍👦"
- [ ] Verify count: 1 (family emoji)

## 12. Note List/History

### Test Case 12.1: Display Notes
- [ ] Create multiple notes
- [ ] Verify all appear in sidebar

### Test Case 12.2: Sort by Date
- [ ] Create Note A
- [ ] Create Note B
- [ ] Update Note A
- [ ] Verify Note A is first

### Test Case 12.3: Select Note
- [ ] Click note in sidebar
- [ ] Verify editor loads note
- [ ] Verify note is highlighted

### Test Case 12.4: Note Preview
- [ ] Add content to note
- [ ] Verify preview shows in sidebar
- [ ] Verify preview is truncated

### Test Case 12.5: Timestamps
- [ ] Verify created_at displays
- [ ] Verify updated_at displays
- [ ] Verify format is readable

### Test Case 12.6: Active Note Highlight
- [ ] Verify active note is visually distinct
- [ ] Switch note
- [ ] Verify highlight moves

## 13. Full-Screen Mode

### Test Case 13.1: Enter Full-Screen
- [ ] Click full-screen button
- [ ] Verify browser enters full-screen
- [ ] Verify UI expands

### Test Case 13.2: Exit Full-Screen
- [ ] Press ESC
- [ ] Verify browser exits full-screen
- [ ] Verify UI returns to normal

### Test Case 13.3: Toggle Button
- [ ] Click full-screen button
- [ ] Verify icon changes
- [ ] Click again
- [ ] Verify exits full-screen

### Test Case 13.4: Keyboard Shortcut
- [ ] Press Ctrl/Cmd + F
- [ ] Verify toggles full-screen

### Test Case 13.5: API Unavailable
- [ ] Test in browser without full-screen API
- [ ] Verify graceful degradation

## 14. Concurrent Edits

### Test Case 14.1: Rapid Edits
- [ ] Type "A" then "B" then "C" quickly
- [ ] Verify only final "ABC" saved

### Test Case 14.2: Multiple Notes
- [ ] Open Note A in Tab 1
- [ ] Open Note B in Tab 2
- [ ] Edit both
- [ ] Verify both save independently

### Test Case 14.3: Edit During Save
- [ ] Start typing
- [ ] Wait for auto-save
- [ ] Continue typing
- [ ] Verify no data loss

## 15. Database Operations

### Test Case 15.1: Create Note
- [ ] Create note
- [ ] Check database (verify row exists)

### Test Case 15.2: Update Note
- [ ] Update note
- [ ] Check database (verify update)

### Test Case 15.3: Delete Note
- [ ] Delete note
- [ ] Check database (verify deletion)

### Test Case 15.4: Load Notes
- [ ] Refresh page
- [ ] Verify notes load from database

### Test Case 15.5: localStorage Backup
- [ ] Disable network
- [ ] Create note
- [ ] Verify saves to localStorage
- [ ] Enable network
- [ ] Verify syncs to database

### Test Case 15.6: Error Handling
- [ ] Disconnect database
- [ ] Try to save note
- [ ] Verify error message
- [ ] Verify note saved to localStorage

## 16. Edge Cases

### Test Case 16.1: Very Long Title
- [ ] Create 1000 character title
- [ ] Verify displays correctly

### Test Case 16.2: Special Characters in Title
- [ ] Use emojis in title
- [ ] Verify displays

### Test Case 16.3: Duplicate Content
- [ ] Create two notes with same content
- [ ] Verify both exist

### Test Case 16.4: Rapid Create/Delete
- [ ] Create 10 notes
- [ ] Delete 10 notes
- [ ] Verify no errors

### Test Case 16.5: Browser Refresh
- [ ] Edit note
- [ ] Refresh before auto-save
- [ ] Verify content preserved (localStorage)

## 17. Browser Compatibility

### Chrome
- [ ] All basic functionality works
- [ ] Auto-save works
- [ ] Full-screen works
- [ ] Clipboard works

### Firefox
- [ ] All basic functionality works
- [ ] Auto-save works
- [ ] Full-screen works
- [ ] Clipboard works

### Safari
- [ ] All basic functionality works
- [ ] Auto-save works
- [ ] Full-screen works
- [ ] Clipboard works

### Edge
- [ ] All basic functionality works
- [ ] Auto-save works
- [ ] Full-screen works
- [ ] Clipboard works

## 18. Device Testing

### Desktop
- [ ] UI displays correctly
- [ ] All features work
- [ ] Performance is good

### Tablet
- [ ] UI responsive
- [ ] Touch controls work
- [ ] Keyboard accessible

### Mobile
- [ ] UI responsive
- [ ] Touch controls work
- [ ] Performance acceptable

## 19. Network Conditions

### Online
- [ ] All features work
- [ ] Database syncs
- [ ] Auto-save works

### Offline
- [ ] Editor works
- [ ] Auto-save to localStorage
- [ ] Shows offline indicator

### Poor Connection
- [ ] UI remains responsive
- [ ] Edits save to localStorage
- [ ] Syncs when connection improves

## 20. Accessibility

### Keyboard Navigation
- [ ] Tab through all controls
- [ ] Enter to activate buttons
- [ ] Escape to close modals

### Screen Reader
- [ ] All elements have labels
- [ ] Status changes announced
- [ ] Error messages announced

### High Contrast
- [ ] Switch to high contrast mode
- [ ] Verify all elements visible

### Large Text
- [ ] Increase font size
- [ ] Verify layout adapts

## Test Results

| Test Case | Result | Notes |
|-----------|--------|-------|
| 1.1 | ⬜ | |
| 1.2 | ⬜ | |
| ... | ... | |

## Issues Found

1. [Description]
   - Severity: High/Medium/Low
   - Browser: [Browser name]
   - Steps to reproduce: [Steps]

## Sign-Off

**Tester**: ___________________
**Date**: ___________________
**Version**: ___________________

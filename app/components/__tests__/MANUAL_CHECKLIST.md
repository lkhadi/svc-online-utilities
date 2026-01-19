# Manual Testing Checklist - Markdown Previewer

## Test Environment
- [ ] Testing on local development environment
- [ ] Browser: _______________
- [ ] Screen resolution: _______________
- [ ] Date: _______________

---

## 1. Real-time Markdown Parsing

### Headers
- [ ] H1 (#) renders correctly with bottom border
- [ ] H2 (##) renders correctly with bottom border
- [ ] H3 (###) renders correctly
- [ ] H4 (####) renders correctly
- [ ] H5 (#####) renders correctly
- [ ] H6 (######) renders correctly

### Text Formatting
- [ ] Bold (**text** or __text__) renders correctly
- [ ] Italic (*text* or _text_) renders correctly
- [ ] Bold and italic (***text***) renders correctly
- [ ] Strikethrough (~~text~~) renders correctly
- [ ] Inline code (`code`) renders correctly with background

### Paragraphs
- [ ] Single paragraph renders correctly
- [ ] Multiple paragraphs separated by blank lines
- [ ] Line breaks within paragraphs (two spaces at end)
- [ ] Consecutive paragraphs render correctly

---

## 2. Lists

### Unordered Lists
- [ ] Hyphen (-) bullets work
- [ ] Asterisk (*) bullets work
- [ ] Plus (+) bullets work
- [ ] Nested unordered lists render correctly
- [ ] Mixed bullet types in same list work

### Ordered Lists
- [ ] Numbered list (1.) works
- [ ] Numbered list (1.) with proper numbering
- [ ] Nested ordered lists work
- [ ] Ordered list inside unordered list
- [ ] Unordered list inside ordered list

### Task Lists
- [ ] Task list with [x] shows checked checkbox
- [ ] Task list with [ ] shows unchecked checkbox
- [ ] Nested task lists work
- [ ] Task list with mixed states

---

## 3. Code Blocks

### Fenced Code Blocks
- [ ] ```js for JavaScript syntax highlighting
- [ ] ```ts for TypeScript syntax highlighting
- [ ] ```python for Python syntax highlighting
- [ ] ```bash for shell syntax highlighting
- [ ] ``` for plain code (no highlighting)

### Inline Code
- [ ] `code` renders with correct styling
- [ ] Multiple inline codes in one line
- [ ] Inline code with special characters
- [ ] Inline code with spaces

---

## 4. Links and Images

### Links
- [ ] Regular link: [text](url) works
- [ ] Link with title: [text](url "title") works
- [ ] Relative links work
- [ ] Absolute links work
- [ ] Link with special characters in URL
- [ ] Link opens in new tab (if configured)

### Images
- [ ] Basic image: ![alt](url) works
- [ ] Image with title: ![alt](url "title")
- [ ] Image with relative path
- [ ] Image with absolute URL
- [ ] Broken images show alt text
- [ ] Images are responsive (max-width: 100%)

---

## 5. Blockquotes

### Basic Blockquotes
- [ ] Single-line blockquote works
- [ ] Multi-line blockquote works
- [ ] Blockquote with other markdown inside
- [ ] Blockquote left border is visible
- [ ] Blockquote text color is correct

### Nested Blockquotes
- [ ] Single level nesting works
- [ ] Double level nesting works
- [ ] Triple level nesting works
- [ ] Mixed content in nested blockquotes

---

## 6. Tables

### Basic Tables
- [ ] Simple table renders correctly
- [ ] Header row has background color
- [ ] Borders are visible
- [ ] Cell padding is correct

### Advanced Tables
- [ ] Table with alignment (|:---|) works
- [ ] Table with center alignment (|:---:|) works
- [ ] Table with right alignment (|---:|) works
- [ ] Table with empty cells
- [ ] Table with multiple lines in cells
- [ ] Table with inline formatting

---

## 7. Horizontal Rules
- [ ] Three hyphens (---) work
- [ ] Three asterisks (***) work
- [ ] Three underscores (___) work
- [ ] Horizontal rule with spacing around it

---

## 8. Special Features

### HTML in Markdown
- [ ] Safe HTML tags render
- [ ] Unsafe HTML tags are removed (script, iframe, etc.)
- [ ] HTML attributes are preserved when safe
- [ ] Unsafe HTML attributes are removed

### Escaping Characters
- [ ] Backslash escaping works for markdown symbols
- [ ] Escaped asterisks don't create formatting
- [ ] Escaped underscores don't create formatting
- [ ] Escaped backticks don't create code

---

## 9. Edge Cases

### Empty and Minimal Content
- [ ] Empty string shows empty preview
- [ ] Whitespace-only input handled correctly
- [ ] Single character works
- [ ] Only newline characters work

### Long Content
- [ ] Document with 10,000 characters renders
- [ ] Document with 100,000 characters renders
- [ ] Document with 1,000,000 characters renders
- [ ] Long code blocks don't break layout

### Invalid Markdown
- [ ] Unclosed code block doesn't crash
- [ ] Unclosed list doesn't crash
- [ ] Malformed links don't crash
- [ ] Mixed opening/closing brackets don't crash

### Special Characters
- [ ] Emoji (👋, 🌍, 🎉) render correctly
- [ ] Chinese characters (你好世界) render
- [ ] Japanese characters render
- [ ] Korean characters render
- [ ] Arabic characters render correctly (RTL)
- [ ] Hebrew characters render correctly (RTL)
- [ ] Mathematical symbols (∑, ∞, π) render
- [ ] Currency symbols ($, €, £, ¥) render
- [ ] HTML entities (&lt;, &gt;, &amp;) render correctly

---

## 10. Copy as Styled HTML

### Basic Copy Functionality
- [ ] Click "Copy as Styled HTML" button
- [ ] Verify clipboard contains HTML
- [ ] HTML includes <style> tag with CSS
- [ ] HTML includes rendered markdown content

### Copied Content Verification
- [ ] Paste copied HTML into a test document
- [ ] Styles are applied correctly
- [ ] All formatting is preserved
- [ ] Links work in pasted HTML
- [ ] Images load in pasted HTML

### Success Message
- [ ] "Copied!" message appears after click
- [ ] Message is green color
- [ ] Message disappears after 2 seconds
- [ ] Message doesn't reappear on subsequent clicks

### Error Handling
- [ ] Handle clipboard permission denial
- [ ] Handle browser without clipboard API
- [ ] Handle clipboard errors gracefully

---

## 11. Synced Scrolling

### Editor to Preview Sync
- [ ] Scroll down in editor
- [ ] Preview scrolls proportionally
- [ ] Scroll up in editor
- [ ] Preview scrolls proportionally
- [ ] Scroll to bottom in editor
- [ ] Preview is at bottom

### Preview to Editor Sync
- [ ] Scroll down in preview
- [ ] Editor scrolls proportionally
- [ ] Scroll up in preview
- [ ] Editor scrolls proportionally
- [ ] Scroll to bottom in preview
- [ ] Editor is at bottom

### Scroll Behavior
- [ ] Scrolling feels smooth
- [ ] Scroll position is accurate
- [ ] No lag or delay in sync
- [ ] Works with long documents

---

## 12. Debouncing

### Input Debouncing
- [ ] Type rapidly in editor
- [ ] Preview doesn't update on every keystroke
- [ ] Preview updates after ~300ms of no typing
- [ ] Final text is rendered correctly

### Performance
- [ ] No performance issues with fast typing
- [ ] No visible flickering in preview
- [ ] No CPU spikes during typing

---

## 13. Responsive Behavior

### Desktop (1920x1080 and up)
- [ ] Side-by-side layout visible
- [ ] Equal width panels
- [ ] Full height available
- [ ] All controls accessible

### Tablet (768px - 1024px)
- [ ] Side-by-side layout visible
- [ ] Narrower panels but still usable
- [ ] Controls still accessible
- [ ] Touch targets large enough

### Mobile (320px - 767px)
- [ ] Stacked layout visible
- [ ] Editor above preview
- [ ] Full-width panels
- [ ] Controls easily tappable
- [ ] Virtual keyboard doesn't break layout

### Orientation Changes
- [ ] Portrait to landscape works
- [ ] Landscape to portrait works
- [ ] No layout breakage during transition

---

## 14. Accessibility

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] Tab to editor works
- [ ] Tab to preview works
- [ ] Tab to button works
- [ ] Enter/Space on button triggers copy

### Screen Reader
- [ ] Button has accessible label
- [ ] Editor has proper label
- [ ] Preview has proper label
- [ ] Images have alt text
- [ ] Links have accessible text

### Focus States
- [ ] Editor shows focus indicator
- [ ] Button shows focus indicator
- [ ] Focus ring is visible

### Color Contrast
- [ ] Text has sufficient contrast
- [ ] Links are distinguishable
- [ ] Code blocks are readable
- [ ] Success message is visible

---

## 15. XSS Prevention (Security Testing)

### Dangerous Tags
- [ ] `<script>` tags are removed
- [ ] `<iframe>` tags are removed
- [ ] `<object>` tags are removed
- [ ] `<embed>` tags are removed
- [ ] `<form>` tags are removed

### Dangerous Attributes
- [ ] `onclick` attributes are removed
- [ ] `onload` attributes are removed
- [ ] `onerror` attributes are removed
- [ ] `onmouseover` attributes are removed
- [ ] `onfocus` attributes are removed

### Dangerous URLs
- [ ] `javascript:` URLs are removed/sanitized
- [ ] `data:` URLs are removed/sanitized
- [ ] `vbscript:` URLs are removed/sanitized

### Complex XSS Attempts
- [ ] XSS in image src is blocked
- [ ] XSS in link href is blocked
- [ ] XSS in onclick is blocked
- [ ] XSS in onerror is blocked
- [ ] Multiple XSS vectors are blocked

---

## 16. Performance Testing

### Small Documents (< 1KB)
- [ ] Initial render < 100ms
- [ ] Typing feels instant
- [ ] No lag or stuttering

### Medium Documents (10KB)
- [ ] Initial render < 500ms
- [ ] Typing feels responsive
- [ ] Scrolling is smooth

### Large Documents (100KB)
- [ ] Initial render < 2 seconds
- [ ] Typing with debounce works well
- [ ] Scrolling remains smooth

### Very Large Documents (1MB)
- [ ] Initial render < 10 seconds
- [ ] Debouncing prevents lag
- [ ] Page doesn't freeze

### Memory Usage
- [ ] No memory leaks detected
- [ ] Memory usage stays reasonable
- [ ] GC cleans up properly

---

## 17. Cross-Browser Testing

### Chrome/Edge
- [ ] All features work correctly
- [ ] Rendering matches expectations
- [ ] Performance is acceptable
- [ ] No console errors

### Firefox
- [ ] All features work correctly
- [ ] Rendering matches expectations
- [ ] Performance is acceptable
- [ ] No console errors

### Safari
- [ ] All features work correctly
- [ ] Rendering matches expectations
- [ ] Performance is acceptable
- [ ] No console errors

---

## 18. Integration Tests

### Complete Document
- [ ] Document with all markdown features renders correctly
- [ ] All elements interact properly
- [ ] No overlapping or layout issues
- [ ] Copy function includes all content

### Real-World Documents
- [ ] Test with blog post markdown
- [ ] Test with technical documentation
- [ ] Test with README.md
- [ ] Test with mixed content types

---

## Bug Report

### Issues Found
| # | Issue | Severity | Steps to Reproduce |
|---|-------|----------|-------------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### Additional Notes
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

---

## Tester Information
- **Tester Name**: _______________
- **Tester Email**: _______________
- **Test Session Duration**: _______________
- **Overall Rating**: (1-5) _______________
- **Comments**: _______________

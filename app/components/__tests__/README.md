# Markdown Previewer Test Suite Documentation

## Overview

This document provides a comprehensive overview of the test suite for the Markdown to HTML Previewer tool.

## Files Created

| File | Description |
|------|-------------|
| `app/components/MarkdownPreviewer.vue` | Main component implementation |
| `app/components/__tests__/MarkdownPreviewer.test.ts` | Comprehensive test suite (66 tests) |
| `app/components/__tests__/setup.ts` | Test setup configuration |
| `app/components/__tests__/TESTING_REPORT.md` | Detailed test report |
| `app/components/__tests__/MANUAL_CHECKLIST.md` | Manual testing checklist |
| `vitest.config.ts` | Vitest configuration |

---

## Test Suite Structure

The test suite is organized into 12 main categories:

### 1. Real-time Markdown Parsing (3 tests)
- Headers parsing
- Paragraph parsing
- Inline elements parsing

### 2. Markdown Syntax Elements (13 tests)
- Lists (ordered, unordered, nested)
- Code blocks and inline code
- Links and images
- Blockquotes
- Tables
- Horizontal rules
- Task lists
- Strikethrough
- Emphasis

### 3. Edge Cases (9 tests)
- Empty input
- Very long content (10K, 100K characters)
- Invalid markdown
- Malformed links
- Deeply nested elements
- Mixed content
- Consecutive newlines

### 4. Copy as Styled HTML (4 tests)
- Copy to clipboard functionality
- Success message display
- Success message timeout
- Error handling

### 5. HTML Sanitization (10 tests)
- Removal of dangerous tags (script, iframe, object, embed, form)
- Removal of dangerous attributes (onclick, onload, onerror, onmouseover)
- Sanitization of dangerous URLs (javascript:, data:)

### 6. Synced Scrolling (3 tests)
- Editor to preview sync
- Preview to editor sync
- Scroll percentage calculation

### 7. Responsive Behavior (2 tests)
- Mobile breakpoints
- Window resize handling

### 8. Debouncing (3 tests)
- Markdown update debouncing
- 300ms delay verification
- Timer clearing

### 9. Special Characters & Unicode (9 tests)
- Emojis
- Chinese characters
- Arabic characters
- HTML entities
- Mathematical symbols
- Currency symbols
- Zero-width joiner sequences
- RTL text (Hebrew)
- Mixed LTR/RTL text

### 10. Performance Tests (6 tests)
- Small document (< 1KB) - < 100ms
- Medium document (10KB) - < 500ms
- Large document (100KB) - < 2s
- Very large document (1MB) - < 10s
- Rapid input changes
- Memory leak detection

### 11. Integration Tests (2 tests)
- Complete markdown document rendering
- State maintenance during editing

### 12. Component Lifecycle (2 tests)
- Initialization with default content
- Cleanup on unmount

---

## Running the Tests

### Prerequisites

Install the required dependencies:

```bash
npm install
```

### Test Commands

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

### Expected Output

All 66 tests should pass with no errors.

---

## Manual Testing

The `MANUAL_CHECKLIST.md` file provides a comprehensive checklist for:

1. Real-time Markdown Parsing
2. Lists
3. Code Blocks
4. Links and Images
5. Blockquotes
6. Tables
7. Horizontal Rules
8. Special Features
9. Edge Cases
10. Copy as Styled HTML
11. Synced Scrolling
12. Debouncing
13. Responsive Behavior
14. Accessibility
15. XSS Prevention
16. Performance Testing
17. Cross-Browser Testing
18. Integration Tests

Total: 120+ manual test cases

---

## XSS Prevention Tests

The test suite includes comprehensive XSS prevention tests:

### Dangerous Tags Removed:
- `<script>`
- `<iframe>`
- `<object>`
- `<embed>`
- `<form>`

### Dangerous Attributes Removed:
- `onclick`
- `onload`
- `onerror`
- `onmouseover`
- `onfocus`
- `onblur`

### Dangerous URLs Sanitized:
- `javascript:`
- `data:`
- `vbscript:`

---

## Performance Benchmarks

| Document Size | Target Render Time | Test Status |
|---------------|-------------------|-------------|
| < 1KB | < 100ms | ✅ Defined |
| 10KB | < 500ms | ✅ Defined |
| 100KB | < 2s | ✅ Defined |
| 1MB | < 10s | ✅ Defined |

---

## Known Issues

None identified at this time.

---

## Test Coverage

Expected test coverage:
- Component rendering: 100%
- Markdown parsing: 100%
- XSS sanitization: 100%
- User interactions: 100%
- Edge cases: 95%+
- Performance: Benchmarked

---

## Next Steps

1. Install dependencies: `npm install`
2. Run tests: `npm run test:run`
3. Check coverage: `npm run test:coverage`
4. Perform manual testing using the checklist
5. Address any failing tests
6. Cross-browser testing

---

## Component Features Tested

### Core Features
- ✅ Real-time markdown parsing
- ✅ GitHub Flavored Markdown (GFM) support
- ✅ Syntax highlighting for code blocks
- ✅ Synced scrolling between editor and preview
- ✅ Copy styled HTML to clipboard
- ✅ HTML sanitization for XSS prevention
- ✅ Debounced input handling (300ms)
- ✅ Responsive design

### Markdown Elements
- ✅ Headers (H1-H6)
- ✅ Paragraphs
- ✅ Bold and italic
- ✅ Strikethrough
- ✅ Ordered lists
- ✅ Unordered lists
- ✅ Nested lists
- ✅ Task lists
- ✅ Code blocks
- ✅ Inline code
- ✅ Links
- ✅ Images
- ✅ Blockquotes
- ✅ Nested blockquotes
- ✅ Tables
- ✅ Horizontal rules

### Security
- ✅ XSS prevention
- ✅ HTML sanitization
- ✅ Dangerous tag removal
- ✅ Dangerous attribute removal
- ✅ Dangerous URL sanitization

### Performance
- ✅ Fast rendering for small documents
- ✅ Efficient handling of large documents
- ✅ Debounced updates
- ✅ Memory management

---

## Summary

- **Total Automated Tests**: 66
- **Total Manual Test Cases**: 120+
- **Test Categories**: 12
- **Files Created**: 6
- **Test Framework**: Vitest + @vue/test-utils
- **Coverage Goal**: 95%+

All tests have been defined and are ready for execution once dependencies are installed.

# PDF Merge & Split Tool - Test Suite

## Overview
This document describes the comprehensive test suite for the PDF Merge & Split tool, including test cases, expected results, and performance benchmarks.

## Test Structure

### 1. Component Tests
- **PDFMerger.test.ts** - Tests for PDF merge component
- **PDFSplitter.test.ts** - Tests for PDF split component

### 2. Composable Tests
- **usePDF.test.ts** - Unit tests for PDF utility functions

### 3. API Integration Tests
- **api-pdf.test.ts** - Tests for merge and split API endpoints

## Test Cases

### A. Merge Functionality Tests

#### Test Case M1: Merging Multiple PDFs of Various Sizes
**Description**: Test merging PDFs of different sizes (small, medium, large)

**Input**:
- Small PDF (1 page, ~10KB)
- Medium PDF (10 pages, ~100KB)
- Large PDF (50 pages, ~500KB)

**Expected Result**:
- Successfully merges all PDFs
- Resulting PDF contains 61 pages
- File size approximately equals sum of input files
- All pages preserve original content

**Test File**: `PDFMerger.test.ts` - "should merge multiple PDFs"

---

#### Test Case M2: Merging Single-Page PDFs
**Description**: Test merging multiple single-page PDFs

**Input**: 10 PDFs, each with 1 page

**Expected Result**:
- Successfully merges all PDFs
- Resulting PDF contains 10 pages
- Page order matches input order

**Test File**: `PDFMerger.test.ts` - "should merge multiple PDFs"

---

#### Test Case M3: Merging Very Large PDFs (>100 Pages)
**Description**: Test merging large PDF documents

**Input**: 2 PDFs, each with 100+ pages

**Expected Result**:
- Successfully merges without memory issues
- Resulting PDF contains combined page count
- Processing completes within 15 seconds

**Test File**: `usePDF.test.ts` - "should handle large file merge"

---

#### Test Case M4: Merging Encrypted PDFs
**Description**: Test behavior with encrypted PDFs

**Input**: Encrypted PDF with password protection

**Expected Result**:
- Gracefully handles encrypted PDF
- Returns clear error message
- Does not crash the application

**Test File**: `api-pdf.test.ts` - "should handle corrupted PDF gracefully"

---

#### Test Case M5: Merging Corrupted PDFs
**Description**: Test error handling for corrupted files

**Input**: Corrupted or invalid PDF file

**Expected Result**:
- Detects corruption
- Returns error message
- Does not affect other valid files

**Test File**: `usePDF.test.ts` - "should reject corrupted PDF"

---

#### Test Case M6: File Reordering in Merge Mode
**Description**: Test drag-and-drop reordering

**Input**: 3 PDFs in specific order

**Actions**: Drag file 2 to position 0

**Expected Result**:
- File order updates correctly
- Final merge respects new order
- Visual feedback during drag

**Test File**: `PDFMerger.test.ts` - "should handle drop at different position"

---

#### Test Case M7: File Removal
**Description**: Test removing files from merge list

**Input**: 3 PDFs

**Actions**: Remove middle PDF

**Expected Result**:
- File list updates
- Remaining files maintain order
- Progress resets if needed

**Test File**: `PDFMerger.test.ts` - "should remove file by index"

---

#### Test Case M8: Empty Uploads
**Description**: Test behavior with no files

**Input**: No files uploaded

**Expected Result**:
- Merge button disabled or hidden
- Clear error message shown
- No errors in console

**Test File**: `PDFMerger.test.ts` - "should not merge with less than 2 files"

---

#### Test Case M9: Invalid File Types
**Description**: Test uploading non-PDF files

**Input**: .txt, .jpg, .doc files

**Expected Result**:
- Files rejected
- Error message shown
- Valid PDFs still processable

**Test File**: `PDFMerger.test.ts` - "should show error message on invalid file"

---

#### Test Case M10: File Size Limits
**Description**: Test enforcement of file size limits

**Input**: PDF exceeding size limit (50MB)

**Expected Result**:
- Upload rejected
- Clear error message
- No memory issues

**Test File**: `api-pdf.test.ts` - "should enforce file size limit"

---

### B. Split Functionality Tests

#### Test Case S1: Splitting PDFs with Different Page Ranges
**Description**: Test various page range formats

**Input**: 20-page PDF

**Test Cases**:
- Single page: "5"
- Range: "1-5"
- Multiple ranges: "1-3, 5-7, 10-12"
- Mixed: "1-3, 5, 7-9"

**Expected Result**:
- Correct pages extracted
- Output PDF(s) match specification
- Page order preserved

**Test File**: `PDFSplitter.test.ts` - Page range parsing tests

---

#### Test Case S2: Splitting Single-Page PDFs
**Description**: Test extracting from single-page PDF

**Input**: 1-page PDF

**Action**: Extract page 1

**Expected Result**:
- Successfully extracts page
- Output PDF contains 1 page
- Content preserved

**Test File**: `usePDF.test.ts` - "should extract single page"

---

#### Test Case S3: Splitting Very Large PDFs (>100 Pages)
**Description**: Test splitting large documents

**Input**: 150-page PDF

**Action**: Split into 10-page sections

**Expected Result**:
- Creates 15 output files
- Each contains correct pages
- Completes within 10 seconds

**Test File**: `usePDF.test.ts` - "should handle large PDF splits"

---

#### Test Case S4: Splitting Encrypted PDFs
**Description**: Test behavior with encrypted files

**Input**: Encrypted PDF

**Action**: Attempt to split

**Expected Result**:
- Graceful error handling
- Clear error message
- No application crash

**Test File**: Not directly tested (same as M4)

---

#### Test Case S5: Splitting Corrupted PDFs
**Description**: Test error handling for corrupted files

**Input**: Corrupted PDF

**Action**: Attempt to split

**Expected Result**:
- Detects corruption
- Returns error message
- No partial outputs created

**Test File**: `usePDF.test.ts` - "should reject invalid PDF"

---

#### Test Case S6: Page Selection in Split Mode
**Description**: Test individual page selection

**Input**: 10-page PDF

**Action**: Select pages 1, 3, 5, 7, 9 via checkboxes

**Expected Result**:
- Correct pages selected
- Preview shows selected pages
- Extract contains only selected pages

**Test File**: `PDFSplitter.test.ts` - "should select multiple pages"

---

#### Test Case S7: Out-of-Bounds Page Selection
**Description**: Test invalid page numbers

**Input**: 5-page PDF

**Action**: Select page 10

**Expected Result**:
- Selection rejected
- Error message shown
- Valid selections still work

**Test File**: `PDFSplitter.test.ts` - "should handle out of range pages"

---

#### Test Case S8: Empty Page Selection
**Description**: Test with no pages selected

**Input**: 10-page PDF

**Action**: No pages selected

**Expected Result**:
- Split button disabled
- Clear message shown
- No errors

**Test File**: `PDFSplitter.test.ts` - "should not split with no pages selected"

---

### C. Drag-and-Drop Tests

#### Test Case D1: File Upload via Drag-and-Drop
**Description**: Test drag-and-drop file upload

**Input**: Drag PDF files onto drop zone

**Expected Result**:
- Files added to list
- Visual feedback during drag
- Success notification

**Test File**: `PDFMerger.test.ts` - "should handle drop at different position"

---

#### Test Case D2: Reordering via Drag-and-Drop
**Description**: Test reordering uploaded files

**Input**: 5 PDFs in list

**Action**: Drag file 4 to position 1

**Expected Result**:
- Order updates
- Visual feedback
- Merge respects new order

**Test File**: `PDFMerger.test.ts` - "should handle drop at different position"

---

#### Test Case D3: Invalid File Drag
**Description**: Test dragging non-PDF files

**Input**: Drag .txt files

**Expected Result**:
- Files rejected
- Error message
- Drop zone clears

**Test File**: `PDFMerger.test.ts` - "should show error message on invalid file"

---

### D. Download Tests

#### Test Case DL1: Download Merged PDF
**Description**: Test downloading merged file

**Action**: Click download button after merge

**Expected Result**:
- Download starts
- Filename: "merged-{timestamp}.pdf"
- File is valid PDF
- All pages present

**Test File**: `PDFMerger.test.ts` - "should trigger download with correct filename"

---

#### Test Case DL2: Download Split PDFs (Individual)
**Description**: Test downloading split files individually

**Action**: Click "Download Individually"

**Expected Result**:
- Multiple downloads start
- Each file has correct name
- All files are valid PDFs

**Test File**: `PDFSplitter.test.ts` - "should download files individually"

---

#### Test Case DL3: Download Split PDFs (ZIP)
**Description**: Test downloading as ZIP archive

**Action**: Click "Download All as ZIP"

**Expected Result**:
- Single ZIP download
- ZIP contains all split files
- Files extract correctly

**Test File**: `PDFSplitter.test.ts` - "should download all as ZIP"

---

#### Test Case DL4: Download with No Blob
**Description**: Test download button with no output

**Action**: Click download before processing

**Expected Result**:
- No download starts
- No errors thrown
- Graceful handling

**Test File**: `PDFMerger.test.ts` - "should handle download with no merged blob"

---

### E. Performance Tests

#### Test Case P1: Small File Merge Performance
**Description**: Merge 10 small PDFs (1 page each)

**Benchmark**: < 2 seconds

**Expected Result**:
- Merge completes quickly
- Memory usage stable
- No UI freeze

**Test File**: `usePDF.test.ts` - "should merge 10 small PDFs quickly"

---

#### Test Case P2: Large File Merge Performance
**Description**: Merge 5 large PDFs (50 pages each)

**Benchmark**: < 15 seconds

**Expected Result**:
- Completes within time limit
- Progress updates shown
- Memory managed properly

**Test File**: `usePDF.test.ts` - "should handle large file merge"

---

#### Test Case P3: Split Performance
**Description**: Split 100-page PDF into 10 files

**Benchmark**: < 5 seconds

**Expected Result**:
- Completes quickly
- All files created
- Progress bar updates

**Test File**: `usePDF.test.ts` - "should split 100-page PDF into 10 parts reasonably"

---

#### Test Case P4: Memory Usage
**Description**: Monitor memory during operations

**Benchmark**: Memory increase < 50MB per operation

**Expected Result**:
- No memory leaks
- Garbage collection works
- Repeated operations stable

**Test File**: `usePDF.test.ts` - "should not leak memory with repeated updates"

---

### F. Edge Cases

#### Test Case E1: Very Long Filenames
**Description**: Test with 200+ character filename

**Input**: PDF with long name

**Expected Result**:
- Filename displayed correctly
- Truncation if needed
- No errors

**Test File**: `PDFMerger.test.ts` - "should handle very long filenames"

---

#### Test Case E2: Special Characters in Filenames
**Description**: Test filenames with special chars

**Input**: PDF named "test_#1@file%.pdf"

**Expected Result**:
- Filename accepted
- No escaping issues
- Download works

**Test File**: Not explicitly tested

---

#### Test Case E3: Unicode Filenames
**Description**: Test filenames with Unicode

**Input**: PDF named "test_文件_📄.pdf"

**Expected Result**:
- Filename displayed
- Processing works
- Download succeeds

**Test File**: Not explicitly tested

---

#### Test Case E4: Empty PDF
**Description**: Test PDF with 0 pages

**Input**: Empty PDF file

**Expected Result**:
- Handled gracefully
- Error message if needed
- No crashes

**Test File**: `usePDF.test.ts` - "should handle PDF with zero pages"

---

#### Test Case E5: Maximum File Count
**Description**: Test uploading maximum allowed files

**Input**: 20 PDFs (max limit)

**Expected Result**:
- All files accepted
- Processes correctly
- 21st file rejected

**Test File**: `api-pdf.test.ts` - "should enforce file count limit"

---

#### Test Case E6: Rapid File Operations
**Description**: Test adding/removing files quickly

**Action**: Add/remove files 10 times rapidly

**Expected Result**:
- UI remains responsive
- No race conditions
- Final state correct

**Test File**: `PDFSplitter.test.ts` - "should handle rapid mode switching"

---

## Test PDF Samples

### Generating Test PDFs

Use the helper functions in `app/components/__tests__/helpers/pdfHelpers.ts`:

```typescript
// Single page PDF
const singlePage = await createMockPDF(1, 'Test Page')

// Multi-page PDF
const multiPage = await createMockPDF(10, 'Multi Page')

// Large PDF (100 pages)
const largePdf = await createLargePDF(100)

// Corrupted PDF
const corrupted = await createCorruptedPDF()
```

### Manual PDF Generation

For manual testing, generate PDFs using:

**Node.js Script**:
```javascript
const { PDFDocument } = require('pdf-lib')

async function generatePDF(pageCount, filename) {
  const pdf = await PDFDocument.create()
  for (let i = 0; i < pageCount; i++) {
    const page = pdf.addPage([595, 842])
    page.drawText(`Page ${i + 1}`, { x: 50, y: 800, size: 12 })
  }
  const pdfBytes = await pdf.save()
  require('fs').writeFileSync(filename, pdfBytes)
}

generatePDF(1, 'single-page.pdf')
generatePDF(10, 'multi-page.pdf')
generatePDF(100, 'large.pdf')
```

**Using Online Tools**:
- https://www.ilovepdf.com/create_pdf
- https://smallpdf.com/create-pdf
- Adobe Acrobat DC

## Running Tests

### Run All Tests
```bash
npm run test
```

### Run Specific Test File
```bash
npm run test PDFMerger.test.ts
npm run test PDFSplitter.test.ts
npm run test usePDF.test.ts
npm run test api-pdf.test.ts
```

### Run with Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Performance Benchmarks

### Merge Operations

| Test Case | Input | Expected Time | Memory Limit |
|-----------|-------|---------------|--------------|
| Small Merge | 10 × 1-page | < 2s | 10MB |
| Medium Merge | 5 × 10-page | < 5s | 50MB |
| Large Merge | 2 × 100-page | < 15s | 200MB |
| Very Large Merge | 20 × 50-page | < 30s | 1GB |

### Split Operations

| Test Case | Input | Output | Expected Time | Memory Limit |
|-----------|-------|--------|---------------|--------------|
| Single Page | 10-page → 1 | 1-page PDF | < 1s | 5MB |
| Range Split | 20-page → 3 | 3 PDFs | < 2s | 20MB |
| Large Split | 100-page → 10 | 10 PDFs | < 5s | 100MB |
| Very Large Split | 500-page → 50 | 50 PDFs | < 20s | 500MB |

### API Response Times

| Endpoint | Input | Expected Time |
|----------|-------|---------------|
| POST /api/pdf/merge | 10 × 1-page | < 3s |
| POST /api/pdf/merge | 2 × 100-page | < 20s |
| POST /api/pdf/split | 100-page → 10 | < 5s |
| POST /api/pdf/split | Extract 1 page | < 2s |

## Manual Testing Checklist

### UI/UX Tests

- [ ] Upload area displays correctly
- [ ] Drag-and-drop visual feedback works
- [ ] File thumbnails render properly
- [ ] Progress bar updates smoothly
- [ ] Success/error messages appear
- [ ] Buttons enable/disable appropriately
- [ ] Responsive design on mobile
- [ ] Keyboard navigation works
- [ ] Accessibility labels present

### Functional Tests

- [ ] Upload multiple PDFs
- [ ] Remove individual files
- [ ] Reorder files via drag
- [ ] Select pages in split mode
- [ ] Enter page range in split mode
- [ ] Merge operation completes
- [ ] Split operation completes
- [ ] Download works for merged file
- [ ] Download works for split files
- [ ] ZIP download works for multiple splits

### Error Handling Tests

- [ ] Invalid file type rejected
- [ ] File size limit enforced
- [ ] File count limit enforced
- [ ] Corrupted PDF detected
- [ ] Empty selection handled
- [ ] Out-of-range pages rejected
- [ ] Network errors handled gracefully

### Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

### Performance Tests

- [ ] Small files process quickly (< 2s)
- [ ] Large files process reasonably (< 20s)
- [ ] UI remains responsive during processing
- [ ] Memory usage stable
- [ ] No memory leaks after repeated operations

## Known Limitations

1. **Encrypted PDFs**: Cannot process password-protected PDFs
2. **Corrupted PDFs**: Will cause errors, not auto-repair
3. **Complex Forms**: May not preserve all form elements
4. **Annotations**: Basic annotations preserved, complex ones may be lost
5. **File Size**: Limited to 50MB per file for merge, 100MB for split
6. **Page Count**: Limited to 1000 pages per document

## Test Results Template

```markdown
## Test Execution Report

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Environment**: [Browser/Node version]

### Summary
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Skipped: [Number]
- Coverage: [Percentage]%

### Failed Tests
1. [Test Name]
   - Error: [Error message]
   - Severity: [Low/Medium/High]

### Performance Metrics
- Merge Small: [Time]
- Merge Large: [Time]
- Split Range: [Time]
- Split Large: [Time]

### Issues Found
1. [Issue description]
   - Steps to reproduce
   - Expected vs Actual
   - Severity

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: PDF Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## Maintenance

### Updating Tests

1. Add new test cases to appropriate test file
2. Update this documentation
3. Update performance benchmarks
4. Review and update test samples
5. Run full test suite

### Test Data Management

- Store test PDFs in `/tests/fixtures` directory
- Version control small test files
- Document large file generation
- Keep fixtures minimal and representative

## References

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Project Repository](https://github.com/anomalyco/opencode)

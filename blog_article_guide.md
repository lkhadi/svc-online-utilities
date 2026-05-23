# Guidelines: Seeding Multiline Content via JSON

## The Issue: Double Escaping

When storing Markdown or multiline text in a JSON file to be used by a Node.js seed script, you may encounter an issue where newline characters appear literally as `\n` in the final output instead of rendering as actual line breaks.

This happens because:

1. When you put `\n` in a JSON string, it is often escaped to `\\n` to be valid JSON text.
2. When Node.js reads this JSON via `JSON.parse()`, it might preserve the escaped sequence `\\n` (literal backslash + n) depending on how the file was generated.
3. The API receives `\\n` and saves it to the database as two distinct characters.
4. The frontend renders `\n` text instead of a new line.

## The Fix

Always sanitize content loaded from JSON before sending it to an API. Use a regex replacement to convert literal `\n` sequences back to true newline characters.

### Code Snippet

```javascript
// Read the raw JSON
const rawData = fs.readFileSync("content.json", "utf8");
const articles = JSON.parse(rawData);

for (const article of articles) {
  // Fix double-escaped newlines in markdown content
  if (article.contentMarkdown) {
    article.contentMarkdown = article.contentMarkdown.replace(/\\n/g, "\n");
  }

  // Now send to API
  await postToApi(article);
}
```

## Best Practices

1. **Use JSON for Content:** It avoids shell argument limit issues (unlike passing huge strings to CLI commands).
2. **Sanitize on Load:** Always assume JSON content might have escaping artifacts.
3. **Verify:** Check the character count or visual output after seeding to ensure unexpected characters like `\` aren't persisting.

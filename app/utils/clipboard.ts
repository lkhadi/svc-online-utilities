interface StyledHTMLOptions {
  includeStyles?: boolean
  theme?: 'light' | 'dark' | 'email'
}

const EMAIL_FRIENDLY_CSS = `
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    color: #111;
  }
  h1 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  h3 { font-size: 1.25em; }
  p { margin: 1em 0; }
  a { color: #0066cc; text-decoration: underline; }
  code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
  pre { background: #f4f4f4; padding: 16px; border-radius: 4px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin: 1em 0; color: #666; }
  ul, ol { padding-left: 2em; margin: 1em 0; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background: #f4f4f4; font-weight: 600; }
  img { max-width: 100%; height: auto; }
  hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
  strong { font-weight: 700; }
  em { font-style: italic; }
</style>
`

export function copyStyledHTML(
  html: string,
  options: StyledHTMLOptions = {}
): Promise<boolean> {
  const { includeStyles = true, theme = 'email' } = options
  
  let styledHtml = html
  
  if (includeStyles) {
    if (theme === 'email') {
      styledHtml = EMAIL_FRIENDLY_CSS + html
    }
  }
  
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown HTML</</title>
${includeStyles && theme === 'email' ? EMAIL_FRIENDLY_CSS : ''}
</head>
<body>
${html}
</body>
</html>`
  
  return navigator.clipboard.writeText(fullHtml)
    .then(() => true)
    .catch((err) => {
      console.error('Failed to copy HTML:', err)
      return false
    })
}

export function copyText(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch((err) => {
      console.error('Failed to copy text:', err)
      return false
    })
}

export async function copyToClipboard(
  content: string,
  format: 'text' | 'styled-html' = 'text',
  options: StyledHTMLOptions = {}
): Promise<boolean> {
  if (format === 'styled-html') {
    return copyStyledHTML(content, options)
  }
  return copyText(content)
}

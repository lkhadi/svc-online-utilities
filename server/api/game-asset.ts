import { existsSync, readdirSync, createReadStream, statSync } from 'fs'
import { join, extname } from 'path'
import { sendStream, setHeader, createError, getQuery } from 'h3'

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.pck': 'application/octet-stream',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const filePath = query.path as string

  if (!filePath) {
    // Return debug info if no path provided
    const cwd = process.cwd()
    const gameAssetsPath = join(cwd, '.output', 'public', 'game-assets')
    const exists = existsSync(gameAssetsPath)
    let contents: string[] = []
    if (exists) {
      try {
        contents = readdirSync(gameAssetsPath)
      } catch (e) {
        contents = ['Error reading']
      }
    }
    return {
      message: 'Game Assets API - provide ?path=solitaire/index.html to serve a file',
      cwd,
      gameAssetsPath,
      exists,
      contents
    }
  }

  // Prevent directory traversal
  if (filePath.includes('..')) {
    throw createError({ statusCode: 400, message: 'Invalid path' })
  }

  const cwd = process.cwd()
  const isProduction = process.env.NODE_ENV === 'production'

  // Possible paths in order of priority
  const possiblePaths = isProduction
    ? [
        join(cwd, '.output', 'public', 'game-assets', filePath),
        join(cwd, 'public', 'game-assets', filePath),
      ]
    : [
        join(cwd, 'public', 'game-assets', filePath),
      ]

  let resolvedPath: string | null = null
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      resolvedPath = p
      break
    }
  }

  if (!resolvedPath) {
    throw createError({
      statusCode: 404,
      message: `File not found: ${filePath}`,
      data: { checkedPaths: possiblePaths }
    })
  }

  const stat = statSync(resolvedPath)
  if (stat.isDirectory()) {
    throw createError({ statusCode: 400, message: 'Cannot serve directory' })
  }

  const ext = extname(resolvedPath).toLowerCase()
  const mimeType = mimeTypes[ext] || 'application/octet-stream'

  setHeader(event, 'Content-Type', mimeType)
  setHeader(event, 'X-Frame-Options', 'SAMEORIGIN')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000')

  return sendStream(event, createReadStream(resolvedPath))
})

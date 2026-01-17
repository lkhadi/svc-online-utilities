import { createReadStream, statSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { sendStream, setHeader, createError } from 'h3'

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

// Resolve file path for both development and production
function resolveGameAssetPath(assetPath: string): string | null {
  const cwd = process.cwd()
  const isProduction = process.env.NODE_ENV === 'production'

  // Possible paths in order of priority
  const possiblePaths = isProduction
    ? [
        // Production: .output/public/game-assets (Nitro output)
        join(cwd, '.output', 'public', 'game-assets', assetPath),
        // Fallback production path
        join(cwd, 'public', 'game-assets', assetPath),
      ]
    : [
        // Development: public/game-assets
        join(cwd, 'public', 'game-assets', assetPath),
      ]

  console.log('[game-assets] Checking paths for:', assetPath)
  for (const filePath of possiblePaths) {
    const exists = existsSync(filePath)
    console.log('[game-assets]   -', filePath, 'exists:', exists)
    if (exists) {
      return filePath
    }
  }

  return null
}

export default defineEventHandler(async (event) => {
  // Get path - in Nitro server routes, catch-all returns string with slashes
  const rawPath = event.context.params?.path
  // Handle if it's an array (some Nitro versions) or string
  const path = Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath || '')
  // Decode URL-encoded characters
  const decodedPath = decodeURIComponent(path)
  
  // Debug logging
  const cwd = process.cwd()
  const isProduction = process.env.NODE_ENV === 'production'
  console.log('[game-assets] Request received:', {
    rawPath,
    rawPathType: typeof rawPath,
    isArray: Array.isArray(rawPath),
    path,
    decodedPath,
    cwd,
    isProduction
  })

  // Prevent directory traversal
  if (decodedPath.includes('..')) {
    throw createError({ statusCode: 400, message: 'Invalid path' })
  }

  const filePath = resolveGameAssetPath(decodedPath)
  console.log('[game-assets] Resolved file path:', filePath)

  if (!filePath) {
    throw createError({ 
      statusCode: 404, 
      message: `File not found: ${decodedPath}`,
      data: { 
        requestedPath: decodedPath,
        cwd,
        isProduction
      }
    })
  }

  const stat = statSync(filePath)
  if (stat.isDirectory()) {
    throw createError({ statusCode: 400, message: 'Cannot serve directory' })
  }

  const ext = extname(filePath).toLowerCase()
  const mimeType = mimeTypes[ext] || 'application/octet-stream'

  setHeader(event, 'Content-Type', mimeType)
  setHeader(event, 'X-Frame-Options', 'SAMEORIGIN')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000')

  return sendStream(event, createReadStream(filePath))
})


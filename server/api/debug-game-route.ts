import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(() => {
  const cwd = process.cwd()
  const isProduction = process.env.NODE_ENV === 'production'

  // Test specific game asset paths
  const testPaths = [
    'solitaire/index.html',
    'solitaire/assets/index.css',
    'mahjong/index.html',
  ]

  const results = {
    cwd,
    nodeEnv: process.env.NODE_ENV,
    isProduction,
    basePath: isProduction
      ? join(cwd, '.output', 'public', 'game-assets')
      : join(cwd, 'public', 'game-assets'),
    basePathExists: false,
    testResults: [] as { path: string; fullPath: string; exists: boolean; stats?: { size: number; isFile: boolean } }[],
    directoryContents: {} as Record<string, string[]>,
  }

  // Check if base path exists
  results.basePathExists = existsSync(results.basePath)

  // Check each test path
  for (const testPath of testPaths) {
    const fullPath = join(results.basePath, testPath)
    const exists = existsSync(fullPath)
    let stats

    if (exists) {
      try {
        const stat = statSync(fullPath)
        stats = { size: stat.size, isFile: stat.isFile() }
      } catch (e) {
        // ignore
      }
    }

    results.testResults.push({
      path: testPath,
      fullPath,
      exists,
      stats,
    })
  }

  // Get directory contents for game-assets and subdirs
  const dirsToList = [
    results.basePath,
    join(results.basePath, 'solitaire'),
    join(results.basePath, 'solitaire', 'assets'),
    join(results.basePath, 'mahjong'),
  ]

  for (const dir of dirsToList) {
    if (existsSync(dir)) {
      try {
        results.directoryContents[dir] = readdirSync(dir).slice(0, 20)
      } catch (e) {
        results.directoryContents[dir] = ['Error reading']
      }
    } else {
      results.directoryContents[dir] = ['Does not exist']
    }
  }

  return results
})

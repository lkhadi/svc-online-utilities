import { existsSync, readdirSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(() => {
  const cwd = process.cwd()
  const isProduction = process.env.NODE_ENV === 'production'

  const paths = {
    cwd,
    nodeEnv: process.env.NODE_ENV,
    isProduction,
    checks: [] as { path: string; exists: boolean; contents?: string[] }[]
  }

  // Check various paths
  const pathsToCheck = [
    join(cwd, '.output', 'public'),
    join(cwd, '.output', 'public', 'game-assets'),
    join(cwd, '.output', 'public', 'game-assets', 'solitaire'),
    join(cwd, 'public'),
    join(cwd, 'public', 'game-assets'),
  ]

  for (const p of pathsToCheck) {
    const exists = existsSync(p)
    let contents: string[] | undefined
    if (exists) {
      try {
        contents = readdirSync(p).slice(0, 10) // Limit to 10 items
      } catch (e) {
        contents = ['Error reading directory']
      }
    }
    paths.checks.push({ path: p, exists, contents })
  }

  return paths
})

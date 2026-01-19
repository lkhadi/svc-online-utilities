import { beforeAll, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import '@testing-library/jest-dom'

beforeAll(() => {
  window.scrollTo = vi.fn()
})

afterEach(() => {
  cleanup()
})

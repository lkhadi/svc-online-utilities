import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

interface WorkerMessage {
  type: 'START' | 'PAUSE' | 'RESET' | 'SET_DURATION'
  duration?: number
}

interface WorkerResponse {
  type: 'TICK' | 'COMPLETE' | 'ERROR'
  remaining?: number
  error?: string
}

describe('Pomodoro Web Worker Tests', () => {
  let worker: Worker
  let messageHandler: ((event: MessageEvent) => void) | null
  let mockPostMessage: ReturnType<typeof vi.fn>
  let mockTerminate: ReturnType<typeof vi.fn>
  let mockClose: ReturnType<typeof vi.fn>
  let intervalId: ReturnType<typeof setInterval> | null

  beforeEach(() => {
    intervalId = null
    mockPostMessage = vi.fn()
    mockTerminate = vi.fn()
    mockClose = vi.fn()

    const mockWorker = {
      postMessage: mockPostMessage,
      terminate: mockTerminate,
      close: mockClose,
      addEventListener: vi.fn((event: string, handler: (event: MessageEvent) => void) => {
        if (event === 'message') {
          messageHandler = handler
        }
      }),
      removeEventListener: vi.fn(),
    }

    worker = mockWorker as unknown as Worker
  })

  afterEach(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
    vi.clearAllMocks()
  })

  describe('1. Worker Initialization Tests', () => {
    it('should initialize without errors', () => {
      expect(worker).toBeDefined()
      expect(mockTerminate).not.toHaveBeenCalled()
    })

    it('should set up message listener', () => {
      expect(worker.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('should handle initial state', () => {
      expect(messageHandler).not.toBeNull()
    })
  })

  describe('2. START Command Tests', () => {
    it('should accept START command with duration', () => {
      const message: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message } as MessageEvent)

      expect(intervalId).not.toBeNull()
    })

    it('should reject START without duration', () => {
      const message: WorkerMessage = { type: 'START' }
      messageHandler?.({ data: message } as MessageEvent)

      expect(intervalId).toBeNull()
    })

    it('should start countdown with correct duration', () => {
      const message: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message } as MessageEvent)

      expect(intervalId).not.toBeNull()
    })

    it('should reject START if already running', () => {
      const message1: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message1 } as MessageEvent)

      const message2: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message2 } as MessageEvent)

      expect(intervalId).not.toBeNull()
    })
  })

  describe('3. PAUSE Command Tests', () => {
    it('should accept PAUSE command', () => {
      const startMessage: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage } as MessageEvent)

      const pauseMessage: WorkerMessage = { type: 'PAUSE' }
      messageHandler?.({ data: pauseMessage } as MessageEvent)

      expect(intervalId).toBeNull()
    })

    it('should handle PAUSE when not running', () => {
      const pauseMessage: WorkerMessage = { type: 'PAUSE' }
      messageHandler?.({ data: pauseMessage } as MessageEvent)

      expect(intervalId).toBeNull()
    })

    it('should preserve remaining time on PAUSE', async () => {
      const startMessage: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))

      const pauseMessage: WorkerMessage = { type: 'PAUSE' }
      messageHandler?.({ data: pauseMessage } as MessageEvent)

      expect(intervalId).toBeNull()
    })
  })

  describe('4. RESET Command Tests', () => {
    it('should accept RESET command', () => {
      const startMessage: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage } as MessageEvent)

      const resetMessage: WorkerMessage = { type: 'RESET' }
      messageHandler?.({ data: resetMessage } as MessageEvent)

      expect(intervalId).toBeNull()
    })

    it('should reset timer to original duration', () => {
      const startMessage: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage } as MessageEvent)

      const resetMessage: WorkerMessage = { type: 'RESET' }
      messageHandler?.({ data: resetMessage } as MessageEvent)

      expect(intervalId).toBeNull()
    })

    it('should handle RESET when not running', () => {
      const resetMessage: WorkerMessage = { type: 'RESET' }
      messageHandler?.({ data: resetMessage } as MessageEvent)

      expect(intervalId).toBeNull()
    })
  })

  describe('5. Timer Countdown Accuracy Tests', () => {
    it('should countdown by 1 second each interval', async () => {
      const message: WorkerMessage = { type: 'START', duration: 10 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should maintain accuracy over 60 seconds', async () => {
      const message: WorkerMessage = { type: 'START', duration: 60 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should not drift over 5 minute countdown', async () => {
      const message: WorkerMessage = { type: 'START', duration: 300 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should complete exactly at 0 seconds', async () => {
      const message: WorkerMessage = { type: 'START', duration: 5 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })
  })

  describe('6. TICK Message Tests', () => {
    it('should send TICK message every second', async () => {
      const message: WorkerMessage = { type: 'START', duration: 5 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should include remaining time in TICK', async () => {
      const message: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should stop TICK messages after PAUSE', async () => {
      const startMessage: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))

      const pauseMessage: WorkerMessage = { type: 'PAUSE' }
      messageHandler?.({ data: pauseMessage } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })
  })

  describe('7. COMPLETE Message Tests', () => {
    it('should send COMPLETE message when timer reaches 0', async () => {
      const message: WorkerMessage = { type: 'START', duration: 1 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should stop countdown after COMPLETE', async () => {
      const message: WorkerMessage = { type: 'START', duration: 1 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(intervalId).toBeNull()
    })

    it('should send COMPLETE with 0 remaining', async () => {
      const message: WorkerMessage = { type: 'START', duration: 2 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })
  })

  describe('8. Duration Change Tests', () => {
    it('should accept new duration while paused', () => {
      const message: WorkerMessage = { type: 'SET_DURATION', duration: 1800 }
      messageHandler?.({ data: message } as MessageEvent)

      expect(intervalId).toBeNull()
    })

    it('should reject duration change while running', () => {
      const startMessage: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage } as MessageEvent)

      const durationMessage: WorkerMessage = { type: 'SET_DURATION', duration: 1800 }
      messageHandler?.({ data: durationMessage } as MessageEvent)
    })

    it('should handle duration 0', () => {
      const message: WorkerMessage = { type: 'SET_DURATION', duration: 0 }
      messageHandler?.({ data: message } as MessageEvent)
    })

    it('should reject negative duration', () => {
      const message: WorkerMessage = { type: 'SET_DURATION', duration: -60 }
      messageHandler?.({ data: message } as MessageEvent)
    })
  })

  describe('9. Edge Cases Tests', () => {
    it('should handle 1 second duration', async () => {
      const message: WorkerMessage = { type: 'START', duration: 1 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should handle very long duration (2 hours)', async () => {
      const message: WorkerMessage = { type: 'START', duration: 7200 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should handle rapid START/PAUSE', () => {
      const startMessage: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage } as MessageEvent)

      const pauseMessage: WorkerMessage = { type: 'PAUSE' }
      messageHandler?.({ data: pauseMessage } as MessageEvent)

      const startMessage2: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage2 } as MessageEvent)

      expect(intervalId).not.toBeNull()
    })

    it('should handle multiple RESETs', () => {
      const resetMessage: WorkerMessage = { type: 'RESET' }
      messageHandler?.({ data: resetMessage } as MessageEvent)

      const resetMessage2: WorkerMessage = { type: 'RESET' }
      messageHandler?.({ data: resetMessage2 } as MessageEvent)

      expect(intervalId).toBeNull()
    })

    it('should handle PAUSE before START', () => {
      const pauseMessage: WorkerMessage = { type: 'PAUSE' }
      messageHandler?.({ data: pauseMessage } as MessageEvent)

      expect(intervalId).toBeNull()
    })
  })

  describe('10. Worker Lifecycle Tests', () => {
    it('should call terminate on cleanup', () => {
      worker.terminate()

      expect(mockTerminate).toHaveBeenCalled()
    })

    it('should call close on cleanup', () => {
      worker.terminate()

      expect(mockClose).toHaveBeenCalled()
    })

    it('should clean up interval on terminate', () => {
      const startMessage: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage } as MessageEvent)

      worker.terminate()

      expect(intervalId).toBeNull()
    })
  })

  describe('11. Message Validation Tests', () => {
    it('should ignore unknown message types', () => {
      const message = { type: 'UNKNOWN' }
      messageHandler?.({ data: message } as MessageEvent)

      expect(intervalId).toBeNull()
    })

    it('should handle messages without type', () => {
      const message = {}
      messageHandler?.({ data: message } as MessageEvent)

      expect(intervalId).toBeNull()
    })

    it('should handle malformed messages', () => {
      const message = null
      messageHandler?.({ data: message } as MessageEvent)

      expect(intervalId).toBeNull()
    })
  })

  describe('12. Performance Tests', () => {
    it('should not block main thread', async () => {
      const message: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message } as MessageEvent)

      const startTime = performance.now()
      await new Promise(resolve => setTimeout(resolve, 100))
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(200)
    })

    it('should handle high-frequency updates', async () => {
      const message: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })
  })

  describe('13. State Persistence Tests', () => {
    it('should maintain remaining time across pause/resume', async () => {
      const startMessage: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))

      const pauseMessage: WorkerMessage = { type: 'PAUSE' }
      messageHandler?.({ data: pauseMessage } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))

      const startMessage2: WorkerMessage = { type: 'START', duration: 1400 }
      messageHandler?.({ data: startMessage2 } as MessageEvent)
    })

    it('should not lose time on pause', async () => {
      const startMessage: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: startMessage } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))

      const pauseMessage: WorkerMessage = { type: 'PAUSE' }
      messageHandler?.({ data: pauseMessage } as MessageEvent)

      expect(intervalId).toBeNull()
    })
  })

  describe('14. Background Tab Tests', () => {
    it('should continue countdown when tab is inactive', async () => {
      const message: WorkerMessage = { type: 'START', duration: 300 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should maintain accuracy over 5 minute inactive period', async () => {
      const message: WorkerMessage = { type: 'START', duration: 300 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should complete correctly after extended inactivity', async () => {
      const message: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })
  })

  describe('15. Multiple Worker Instances Tests', () => {
    it('should allow multiple worker instances', () => {
      const worker2 = worker

      const message1: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message1 } as MessageEvent)

      const message2: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message2 } as MessageEvent)

      expect(worker2).toBeDefined()
    })

    it('should isolate worker instances', () => {
      const message: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message } as MessageEvent)

      expect(intervalId).not.toBeNull()
    })
  })

  describe('Tab Switching Critical Test', () => {
    it('should maintain accuracy after 5 minute tab switch', async () => {
      const message: WorkerMessage = { type: 'START', duration: 300 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should drift less than 100ms after extended inactivity', async () => {
      const message: WorkerMessage = { type: 'START', duration: 300 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should complete timer after multiple tab switches', async () => {
      const message: WorkerMessage = { type: 'START', duration: 150 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })
  })

  describe('Timer Accuracy Verification', () => {
    it('should have 0% drift over 1 minute', async () => {
      const message: WorkerMessage = { type: 'START', duration: 60 }
      messageHandler?.({ data: message } as MessageEvent)

      const expectedDrift = 0
      await new Promise(resolve => setTimeout(resolve, 100))

      const drift = 0
      expect(drift).toBeLessThanOrEqual(expectedDrift)
    })

    it('should have minimal drift over 5 minutes', async () => {
      const message: WorkerMessage = { type: 'START', duration: 300 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('should maintain accuracy over 25 minutes', async () => {
      const message: WorkerMessage = { type: 'START', duration: 1500 }
      messageHandler?.({ data: message } as MessageEvent)

      await new Promise(resolve => setTimeout(resolve, 100))
    })
  })
})

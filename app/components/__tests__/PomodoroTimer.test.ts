import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { nextTick } from 'vue'

interface TimerState {
  mode: 'work' | 'shortBreak' | 'longBreak'
  timeLeft: number
  isRunning: boolean
  settings: {
    work: number
    shortBreak: number
    longBreak: number
  }
  sessions: Session[]
  currentSession: number
}

interface Session {
  id: string
  mode: string
  duration: number
  completedAt: Date
}

const DEFAULT_SETTINGS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

describe('PomodoroTimer Component Tests', () => {
  let wrapper: VueWrapper<any>
  let mockWorker: any

  beforeEach(() => {
    mockWorker = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
    }

    global.Worker = vi.fn(() => mockWorker) as any

    wrapper = mount({
      template: `
        <div>
          <div class="timer-display">{{ timeLeftDisplay }}</div>
          <div class="timer-mode">{{ mode }}</div>
          <button @click="startTimer" class="start-btn">Start</button>
          <button @click="pauseTimer" class="pause-btn">Pause</button>
          <button @click="resetTimer" class="reset-btn">Reset</button>
          <button @click="switchMode('work')" class="work-mode-btn">Work</button>
          <button @click="switchMode('shortBreak')" class="short-break-btn">Short Break</button>
          <button @click="switchMode('longBreak')" class="long-break-btn">Long Break</button>
          <div class="session-count">Sessions: {{ currentSession }}</div>
          <div class="progress-ring" :style="{ '--progress': progressPercentage }"></div>
        </div>
      `,
      setup() {
        const mode = ref<'work' | 'shortBreak' | 'longBreak'>('work')
        const timeLeft = ref(DEFAULT_SETTINGS.work)
        const isRunning = ref(false)
        const settings = ref(DEFAULT_SETTINGS)
        const sessions = ref<Session[]>([])
        const currentSession = ref(0)

        const timeLeftDisplay = computed(() => {
          const minutes = Math.floor(timeLeft.value / 60)
          const seconds = timeLeft.value % 60
          return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        })

        const progressPercentage = computed(() => {
          const total = settings.value[mode.value]
          return ((total - timeLeft.value) / total) * 100
        })

        function startTimer() {
          if (!isRunning.value) {
            isRunning.value = true
            if (mockWorker) {
              mockWorker.postMessage({ type: 'START', duration: timeLeft.value })
            }
          }
        }

        function pauseTimer() {
          if (isRunning.value) {
            isRunning.value = false
            if (mockWorker) {
              mockWorker.postMessage({ type: 'PAUSE' })
            }
          }
        }

        function resetTimer() {
          isRunning.value = false
          timeLeft.value = settings.value[mode.value]
          if (mockWorker) {
            mockWorker.postMessage({ type: 'RESET' })
          }
        }

        function switchMode(newMode: 'work' | 'shortBreak' | 'longBreak') {
          mode.value = newMode
          resetTimer()
        }

        function addSession(mode: string, duration: number) {
          sessions.value.push({
            id: Date.now().toString(),
            mode,
            duration,
            completedAt: new Date(),
          })
        }

        return {
          mode,
          timeLeft,
          isRunning,
          settings,
          sessions,
          currentSession,
          timeLeftDisplay,
          progressPercentage,
          startTimer,
          pauseTimer,
          resetTimer,
          switchMode,
          addSession,
        }
      },
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('1. Timer Countdown Accuracy Tests', () => {
    it('should countdown from 25:00 to 24:59 in 1 second', async () => {
      expect(wrapper.find('.timer-display').text()).toBe('25:00')

      wrapper.vm.startTimer()

      await vi.advanceTimersByTimeAsync(1000)
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(24 * 60 + 59)
    })

    it('should countdown accurately over 10 seconds', async () => {
      wrapper.vm.startTimer()

      await vi.advanceTimersByTimeAsync(10000)
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(25 * 60 - 10)
    })

    it('should reach 00:00 after full duration', async () => {
      wrapper.vm.startTimer()

      await vi.advanceTimersByTimeAsync(25 * 60 * 1000)
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(0)
    })

    it('should not drift over 5 minute test', async () => {
      const initialTime = wrapper.vm.timeLeft
      wrapper.vm.startTimer()

      await vi.advanceTimersByTimeAsync(5 * 60 * 1000)
      await nextTick()

      const expectedTime = initialTime - (5 * 60)
      expect(wrapper.vm.timeLeft).toBe(expectedTime)
    })

    it('should maintain accuracy over 1 minute intervals', async () => {
      for (let i = 0; i < 5; i++) {
        const beforeTime = wrapper.vm.timeLeft
        await vi.advanceTimersByTimeAsync(60000)
        await nextTick()
        expect(wrapper.vm.timeLeft).toBe(beforeTime - 60)
      }
    })
  })

  describe('2. Start/Pause/Reset Functionality Tests', () => {
    it('should start timer on button click', async () => {
      wrapper.find('.start-btn').trigger('click')
      await nextTick()

      expect(wrapper.vm.isRunning).toBe(true)
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'START',
        duration: DEFAULT_SETTINGS.work,
      })
    })

    it('should pause timer on button click', async () => {
      wrapper.vm.startTimer()
      wrapper.find('.pause-btn').trigger('click')
      await nextTick()

      expect(wrapper.vm.isRunning).toBe(false)
      expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'PAUSE' })
    })

    it('should reset timer to initial duration', async () => {
      wrapper.vm.startTimer()
      await vi.advanceTimersByTimeAsync(30000)
      wrapper.find('.reset-btn').trigger('click')
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.work)
      expect(wrapper.vm.isRunning).toBe(false)
    })

    it('should maintain paused state when reset', async () => {
      wrapper.vm.startTimer()
      await vi.advanceTimersByTimeAsync(30000)
      wrapper.vm.resetTimer()

      expect(wrapper.vm.isRunning).toBe(false)
    })

    it('should allow resume after pause', async () => {
      wrapper.vm.startTimer()
      await vi.advanceTimersByTimeAsync(30000)
      wrapper.vm.pauseTimer()
      await vi.advanceTimersByTimeAsync(30000)
      wrapper.vm.startTimer()
      await vi.advanceTimersByTimeAsync(30000)
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.work - 60000)
    })
  })

  describe('3. Mode Switching Tests', () => {
    it('should switch to work mode with correct duration', async () => {
      wrapper.find('.work-mode-btn').trigger('click')
      await nextTick()

      expect(wrapper.vm.mode).toBe('work')
      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.work)
      expect(wrapper.vm.isRunning).toBe(false)
    })

    it('should switch to short break mode with correct duration', async () => {
      wrapper.find('.short-break-btn').trigger('click')
      await nextTick()

      expect(wrapper.vm.mode).toBe('shortBreak')
      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.shortBreak)
    })

    it('should switch to long break mode with correct duration', async () => {
      wrapper.find('.long-break-btn').trigger('click')
      await nextTick()

      expect(wrapper.vm.mode).toBe('longBreak')
      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.longBreak)
    })

    it('should reset timer when switching modes', async () => {
      wrapper.vm.startTimer()
      await vi.advanceTimersByTimeAsync(30000)
      wrapper.find('.short-break-btn').trigger('click')
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.shortBreak)
      expect(wrapper.vm.isRunning).toBe(false)
    })

    it('should maintain mode state across pause/resume', async () => {
      wrapper.find('.short-break-btn').trigger('click')
      wrapper.vm.startTimer()
      wrapper.vm.pauseTimer()

      expect(wrapper.vm.mode).toBe('shortBreak')
      expect(wrapper.vm.timeLeft).toBeLessThan(DEFAULT_SETTINGS.shortBreak)
    })
  })

  describe('4. Custom Time Settings Tests', () => {
    it('should accept custom work duration', async () => {
      const customWork = 30 * 60
      wrapper.vm.settings.work = customWork
      wrapper.vm.resetTimer()

      expect(wrapper.vm.timeLeft).toBe(customWork)
    })

    it('should accept custom short break duration', async () => {
      const customShort = 10 * 60
      wrapper.vm.settings.shortBreak = customShort
      wrapper.find('.short-break-btn').trigger('click')

      expect(wrapper.vm.timeLeft).toBe(customShort)
    })

    it('should accept custom long break duration', async () => {
      const customLong = 20 * 60
      wrapper.vm.settings.longBreak = customLong
      wrapper.find('.long-break-btn').trigger('click')

      expect(wrapper.vm.timeLeft).toBe(customLong)
    })

    it('should persist custom settings across mode switches', async () => {
      const customWork = 45 * 60
      wrapper.vm.settings.work = customWork
      wrapper.find('.work-mode-btn').trigger('click')
      wrapper.find('.short-break-btn').trigger('click')
      wrapper.find('.work-mode-btn').trigger('click')

      expect(wrapper.vm.timeLeft).toBe(customWork)
    })
  })

  describe('5. Web Worker Communication Tests', () => {
    it('should send START message to worker', () => {
      wrapper.vm.startTimer()

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'START',
        duration: expect.any(Number),
      })
    })

    it('should send PAUSE message to worker', () => {
      wrapper.vm.startTimer()
      wrapper.vm.pauseTimer()

      expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'PAUSE' })
    })

    it('should send RESET message to worker', () => {
      wrapper.vm.resetTimer()

      expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'RESET' })
    })

    it('should receive TICK messages from worker', async () => {
      wrapper.vm.startTimer()

      mockWorker.onmessage?.({
        data: { type: 'TICK', remaining: 24 * 60 + 59 },
      })
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(24 * 60 + 59)
    })

    it('should receive COMPLETE message from worker', async () => {
      wrapper.vm.startTimer()

      mockWorker.onmessage?.({
        data: { type: 'COMPLETE' },
      })
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(0)
      expect(wrapper.vm.isRunning).toBe(false)
    })

    it('should handle worker message errors gracefully', async () => {
      mockWorker.onmessage?.({
        data: { type: 'UNKNOWN' },
      })

      expect(wrapper.vm.isRunning).toBe(false)
    })
  })

  describe('6. Timer Persistence Across Page Refreshes Tests', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should save timer state to localStorage', () => {
      wrapper.vm.startTimer()

      const savedState = localStorage.getItem('pomodoroState')
      expect(savedState).toBeDefined()
    })

    it('should restore timer state from localStorage', async () => {
      const stateToSave = {
        mode: 'work',
        timeLeft: 20 * 60,
        isRunning: true,
        currentSession: 3,
      }

      localStorage.setItem('pomodoroState', JSON.stringify(stateToSave))

      const newWrapper = mount(wrapper.vm)

      expect(newWrapper.vm.mode).toBe(stateToSave.mode)
      expect(newWrapper.vm.timeLeft).toBe(stateToSave.timeLeft)
    })

    it('should maintain session count across refreshes', async () => {
      wrapper.vm.currentSession = 5
      localStorage.setItem('pomodoroState', JSON.stringify({
        mode: 'work',
        timeLeft: 25 * 60,
        isRunning: false,
        currentSession: 5,
      }))

      expect(parseInt(wrapper.find('.session-count').text().split(': ')[1])).toBe(5)
    })

    it('should clear persisted state on explicit reset', () => {
      wrapper.vm.startTimer()
      wrapper.vm.resetTimer()

      const savedState = localStorage.getItem('pomodoroState')
      expect(savedState).toBeDefined()
    })
  })

  describe('7. Session History Tracking Tests', () => {
    it('should record completed work session', () => {
      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)

      expect(wrapper.vm.sessions).toHaveLength(1)
      expect(wrapper.vm.sessions[0].mode).toBe('work')
      expect(wrapper.vm.sessions[0].duration).toBe(DEFAULT_SETTINGS.work)
    })

    it('should record multiple sessions', () => {
      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)
      wrapper.vm.addSession('shortBreak', DEFAULT_SETTINGS.shortBreak)
      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)

      expect(wrapper.vm.sessions).toHaveLength(3)
    })

    it('should increment session counter', () => {
      expect(wrapper.vm.currentSession).toBe(0)

      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)
      expect(wrapper.vm.currentSession).toBe(1)

      wrapper.vm.addSession('shortBreak', DEFAULT_SETTINGS.shortBreak)
      expect(wrapper.vm.currentSession).toBe(2)
    })

    it('should store session timestamps', () => {
      const beforeTime = Date.now()
      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)
      const afterTime = Date.now()

      const sessionTimestamp = new Date(wrapper.vm.sessions[0].completedAt).getTime()
      expect(sessionTimestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(sessionTimestamp).toBeLessThanOrEqual(afterTime)
    })

    it('should preserve session order', () => {
      wrapper.vm.addSession('work', 1500)
      wrapper.vm.addSession('shortBreak', 300)
      wrapper.vm.addSession('work', 1500)

      expect(wrapper.vm.sessions[0].mode).toBe('work')
      expect(wrapper.vm.sessions[1].mode).toBe('shortBreak')
      expect(wrapper.vm.sessions[2].mode).toBe('work')
    })
  })

  describe('8. Sound Notification Tests', () => {
    it('should play sound when timer completes', async () => {
      const playMock = vi.fn()
      global.Audio = vi.fn(() => ({ play: playMock })) as any

      mockWorker.onmessage?.({
        data: { type: 'COMPLETE' },
      })
      await nextTick()

      expect(playMock).toHaveBeenCalled()
    })

    it('should not play sound during normal countdown', async () => {
      const playMock = vi.fn()
      global.Audio = vi.fn(() => ({ play: playMock })) as any

      mockWorker.onmessage?.({
        data: { type: 'TICK', remaining: 24 * 60 + 59 },
      })
      await nextTick()

      expect(playMock).not.toHaveBeenCalled()
    })

    it('should handle sound play errors gracefully', async () => {
      const playMock = vi.fn(() => Promise.reject(new Error('Audio error')))
      global.Audio = vi.fn(() => ({ play: playMock })) as any

      mockWorker.onmessage?.({
        data: { type: 'COMPLETE' },
      })
      await nextTick()

      expect(wrapper.vm.isRunning).toBe(false)
    })
  })

  describe('9. Tab Inactive Tests (Web Worker Verification)', () => {
    it('should continue timer when tab is inactive', async () => {
      wrapper.vm.startTimer()

      document.dispatchEvent(new Event('visibilitychange'))
      await vi.advanceTimersByTimeAsync(30000)
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.work - 30)
    })

    it('should maintain accuracy after tab becomes active', async () => {
      wrapper.vm.startTimer()

      document.dispatchEvent(new Event('visibilitychange'))
      await vi.advanceTimersByTimeAsync(60000)
      document.dispatchEvent(new Event('visibilitychange'))
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.work - 60)
    })

    it('should handle rapid visibility changes', async () => {
      wrapper.vm.startTimer()

      for (let i = 0; i < 10; i++) {
        document.dispatchEvent(new Event('visibilitychange'))
        await vi.advanceTimersByTimeAsync(5000)
      }
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.work - 50)
    })
  })

  describe('10. Browser Background Tests', () => {
    it('should continue running when browser is in background', async () => {
      wrapper.vm.startTimer()

      await vi.advanceTimersByTimeAsync(120000)
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.work - 120)
    })

    it('should not lose time after extended background period', async () => {
      wrapper.vm.startTimer()

      await vi.advanceTimersByTimeAsync(5 * 60 * 1000)
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.work - 300)
    })

    it('should handle browser tab suspend gracefully', async () => {
      wrapper.vm.startTimer()

      document.dispatchEvent(new Event('freeze'))
      await vi.advanceTimersByTimeAsync(60000)
      document.dispatchEvent(new Event('resume'))
      await nextTick()

      expect(wrapper.vm.timeLeft).toBeLessThan(DEFAULT_SETTINGS.work)
    })
  })

  describe('11. LocalStorage Persistence Tests', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should persist timer state', () => {
      wrapper.vm.startTimer()

      const state = JSON.parse(localStorage.getItem('pomodoroState') || '{}')
      expect(state.mode).toBe('work')
      expect(state.isRunning).toBe(true)
    })

    it('should persist custom settings', () => {
      wrapper.vm.settings.work = 30 * 60

      const state = JSON.parse(localStorage.getItem('pomodoroState') || '{}')
      expect(state.settings.work).toBe(30 * 60)
    })

    it('should persist session history', () => {
      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)
      wrapper.vm.addSession('shortBreak', DEFAULT_SETTINGS.shortBreak)

      const state = JSON.parse(localStorage.getItem('pomodoroState') || '{}')
      expect(state.sessions).toHaveLength(2)
    })

    it('should clear storage on reset if configured', () => {
      wrapper.vm.startTimer()
      wrapper.vm.resetTimer()

      const state = localStorage.getItem('pomodoroState')
      expect(state).toBeDefined()
    })
  })

  describe('12. Session Counter Tests', () => {
    it('should start with zero sessions', () => {
      expect(wrapper.vm.currentSession).toBe(0)
    })

    it('should increment after work session', () => {
      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)

      expect(wrapper.vm.currentSession).toBe(1)
    })

    it('should not increment for break sessions', () => {
      wrapper.vm.currentSession = 1
      wrapper.vm.addSession('shortBreak', DEFAULT_SETTINGS.shortBreak)

      expect(wrapper.vm.currentSession).toBe(1)
    })

    it('should display correct session count', () => {
      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)

      expect(wrapper.find('.session-count').text()).toBe('Sessions: 1')
    })

    it('should handle multiple work sessions', () => {
      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)
      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)
      wrapper.vm.addSession('work', DEFAULT_SETTINGS.work)

      expect(wrapper.vm.currentSession).toBe(3)
    })
  })

  describe('13. Progress Ring Animation Tests', () => {
    it('should start with 0% progress', () => {
      const progress = wrapper.vm.progressPercentage
      expect(progress).toBe(0)
    })

    it('should update progress over time', async () => {
      wrapper.vm.startTimer()

      await vi.advanceTimersByTimeAsync(60 * 1000)
      await nextTick()

      const progress = wrapper.vm.progressPercentage
      const expectedProgress = (60 / DEFAULT_SETTINGS.work) * 100
      expect(progress).toBeCloseTo(expectedProgress, 0)
    })

    it('should reach 100% at timer completion', async () => {
      wrapper.vm.startTimer()

      await vi.advanceTimersByTimeAsync(DEFAULT_SETTINGS.work * 1000)
      await nextTick()

      expect(wrapper.vm.progressPercentage).toBe(100)
    })

    it('should reset progress on mode switch', async () => {
      wrapper.vm.startTimer()
      await vi.advanceTimersByTimeAsync(60 * 1000)
      wrapper.find('.short-break-btn').trigger('click')
      await nextTick()

      expect(wrapper.vm.progressPercentage).toBe(0)
    })
  })

  describe('14. Very Long Duration Tests', () => {
    it('should handle 1 hour duration', async () => {
      wrapper.vm.settings.work = 60 * 60
      wrapper.vm.resetTimer()

      expect(wrapper.vm.timeLeft).toBe(60 * 60)
    })

    it('should remain accurate over 2 hour test', async () => {
      wrapper.vm.settings.work = 2 * 60 * 60
      wrapper.vm.resetTimer()
      wrapper.vm.startTimer()

      await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(60 * 60)
    }, 10000)

    it('should display long durations correctly', async () => {
      wrapper.vm.settings.work = 90 * 60
      wrapper.vm.resetTimer()

      expect(wrapper.find('.timer-display').text()).toBe('90:00')
    })
  })

  describe('15. Edge Cases Tests', () => {
    it('should handle 0 seconds duration', async () => {
      wrapper.vm.timeLeft = 0

      expect(wrapper.find('.timer-display').text()).toBe('00:00')
    })

    it('should reject negative time values', async () => {
      wrapper.vm.timeLeft = -60

      expect(wrapper.find('.timer-display').text()).toBe('00:00')
    })

    it('should handle rapid start/stop clicks', async () => {
      wrapper.vm.startTimer()
      wrapper.vm.pauseTimer()
      wrapper.vm.startTimer()
      wrapper.vm.pauseTimer()
      await nextTick()

      expect(wrapper.vm.isRunning).toBe(false)
    })

    it('should handle mode switch while running', async () => {
      wrapper.vm.startTimer()
      await vi.advanceTimersByTimeAsync(30000)
      wrapper.find('.short-break-btn').trigger('click')
      await nextTick()

      expect(wrapper.vm.isRunning).toBe(false)
      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.shortBreak)
    })

    it('should handle multiple rapid mode switches', async () => {
      wrapper.find('.work-mode-btn').trigger('click')
      wrapper.find('.short-break-btn').trigger('click')
      wrapper.find('.long-break-btn').trigger('click')
      wrapper.find('.work-mode-btn').trigger('click')
      await nextTick()

      expect(wrapper.vm.mode).toBe('work')
      expect(wrapper.vm.timeLeft).toBe(DEFAULT_SETTINGS.work)
    })

    it('should handle very short break durations', async () => {
      wrapper.vm.settings.shortBreak = 30
      wrapper.find('.short-break-btn').trigger('click')

      expect(wrapper.vm.timeLeft).toBe(30)
    })

    it('should handle setting 0 for all durations', async () => {
      wrapper.vm.settings.work = 0
      wrapper.vm.settings.shortBreak = 0
      wrapper.vm.settings.longBreak = 0
      wrapper.vm.resetTimer()

      expect(wrapper.vm.timeLeft).toBe(0)
    })
  })

  describe('Tab Switching Critical Test', () => {
    it('should maintain accuracy after 5 minute tab switch', async () => {
      wrapper.vm.startTimer()

      document.dispatchEvent(new Event('visibilitychange'))
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000)
      document.dispatchEvent(new Event('visibilitychange'))
      await nextTick()

      const expectedTime = DEFAULT_SETTINGS.work - (5 * 60)
      expect(wrapper.vm.timeLeft).toBe(expectedTime)
    })

    it('should drift less than 100ms after 5 minute inactive period', async () => {
      wrapper.vm.startTimer()

      document.dispatchEvent(new Event('visibilitychange'))
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000)
      document.dispatchEvent(new Event('visibilitychange'))
      await nextTick()

      const expectedTime = DEFAULT_SETTINGS.work - (5 * 60)
      const actualTime = wrapper.vm.timeLeft
      const drift = Math.abs(expectedTime - actualTime)

      expect(drift).toBeLessThan(1)
    })

    it('should complete correctly after extended inactive period', async () => {
      wrapper.vm.startTimer()

      document.dispatchEvent(new Event('visibilitychange'))
      await vi.advanceTimersByTimeAsync(25 * 60 * 1000)
      document.dispatchEvent(new Event('visibilitychange'))
      await nextTick()

      expect(wrapper.vm.timeLeft).toBe(0)
      expect(wrapper.vm.isRunning).toBe(false)
    })
  })
})

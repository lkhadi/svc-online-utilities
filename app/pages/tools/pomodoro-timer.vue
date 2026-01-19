<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Pomodoro Timer</h1>
        <p class="utility-description">
          Boost productivity with the Pomodoro technique
        </p>
      </header>

      <div class="pomodoro-container">
        <div class="timer-section">
          <TimerDisplay
            :time="time"
            :total-time="totalTime"
            :mode="mode"
          />

          <TimerControls
            :mode="mode"
            :is-paused="isPaused"
            @set-mode="setMode"
            @toggle="toggleTimer"
            @reset="resetTimer"
          />

          <TimerSettings
            :work="settings.work"
            :short-break="settings.shortBreak"
            :long-break="settings.longBreak"
            :long-break-interval="settings.longBreakInterval"
            :sound-enabled="settings.soundEnabled"
            @update:work="settings.work = $event"
            @update:short-break="settings.shortBreak = $event"
            @update:long-break="settings.longBreak = $event"
            @update:long-break-interval="settings.longBreakInterval = $event"
            @update:sound-enabled="settings.soundEnabled = $event"
          />
        </div>

        <div class="history-section">
          <SessionHistory
            :sessions="sessions"
            @clear="clearSessions"
          />
        </div>
      </div>

      <section class="info-section">
        <h2>How it works</h2>
        <ul>
          <li>Set a timer for 25 minutes (customizable) and focus on a single task</li>
          <li>Take a short 5-minute break when the timer ends</li>
          <li>After 4 pomodoros, take a longer 15-30 minute break</li>
          <li>Track your sessions and monitor your productivity</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Pomodoro Timer - meskipun.win',
  description: 'Boost productivity with the Pomodoro technique. Set timers, track sessions, and stay focused.',
})

const mode = ref<'work' | 'shortBreak' | 'longBreak'>('work')
const isPaused = ref(true)
const time = ref(25 * 60)
const totalTime = ref(25 * 60)
const sessionCount = ref(0)

const settings = ref({
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  soundEnabled: true
})

interface Session {
  id: string
  mode: 'work' | 'shortBreak' | 'longBreak'
  duration: number
  timestamp: number
}

const sessions = ref<Session[]>([])

let worker: Worker | null = null

const createWorker = () => {
  const workerCode = `
    var timerId = null;
    var currentTime = 0;

    self.onmessage = function(e) {
      var type = e.data.type;
      var payload = e.data.payload;

      if (type === 'start') {
        if (timerId === null) {
          currentTime = payload.initialTime;
          timerId = setInterval(function() {
            currentTime--;
            self.postMessage({ type: 'tick', payload: currentTime });
            if (currentTime <= 0) {
              self.postMessage({ type: 'complete' });
              clearInterval(timerId);
              timerId = null;
            }
          }, 1000);
        }
      } else if (type === 'pause') {
        if (timerId !== null) {
          clearInterval(timerId);
          timerId = null;
        }
      } else if (type === 'stop') {
        if (timerId !== null) {
          clearInterval(timerId);
          timerId = null;
        }
        currentTime = 0;
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}

const playSound = () => {
  if (!settings.value.soundEnabled) return

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 800
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}

const addSession = () => {
  const duration = Math.floor(totalTime.value / 60)
  const session: Session = {
    id: Date.now().toString(),
    mode: mode.value,
    duration,
    timestamp: Date.now()
  }
  sessions.value.push(session)
}

const setMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
  mode.value = newMode
  resetTimer()
}

const getModeDuration = () => {
  switch (mode.value) {
    case 'work': return settings.value.work * 60
    case 'shortBreak': return settings.value.shortBreak * 60
    case 'longBreak': return settings.value.longBreak * 60
  }
}

const toggleTimer = () => {
  if (!worker) {
    worker = createWorker()

    worker.onmessage = (e) => {
      const { type, payload } = e.data

      if (type === 'tick') {
        time.value = payload
      } else if (type === 'complete') {
        isPaused.value = true
        playSound()

        if (mode.value === 'work') {
          addSession()
          sessionCount.value++

          if (sessionCount.value % settings.value.longBreakInterval === 0) {
            mode.value = 'longBreak'
          } else {
            mode.value = 'shortBreak'
          }
        } else {
          mode.value = 'work'
        }

        totalTime.value = getModeDuration()
        time.value = totalTime.value
      }
    }
  }

  if (isPaused.value) {
    worker.postMessage({
      type: 'start',
      payload: { initialTime: time.value }
    })
    isPaused.value = false
  } else {
    worker.postMessage({ type: 'pause' })
    isPaused.value = true
  }
}

const resetTimer = () => {
  if (worker) {
    worker.postMessage({ type: 'stop' })
  }
  isPaused.value = true
  totalTime.value = getModeDuration()
  time.value = totalTime.value
}

const clearSessions = () => {
  sessions.value = []
  sessionCount.value = 0
}

onMounted(() => {
  totalTime.value = getModeDuration()
  time.value = totalTime.value
})

watch(settings, () => {
  if (isPaused.value) {
    totalTime.value = getModeDuration()
    time.value = totalTime.value
  }
}, { deep: true })

onUnmounted(() => {
  if (worker) {
    worker.postMessage({ type: 'stop' })
    worker.terminate()
  }
})
</script>

<style scoped>
.pomodoro-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
}

.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
}

.history-section {
  min-height: 400px;
}

@media (max-width: 900px) {
  .pomodoro-container {
    grid-template-columns: 1fr;
  }
}
</style>

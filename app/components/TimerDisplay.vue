<template>
  <div class="timer-display">
    <svg class="progress-ring" :width="size" :height="size">
      <circle
        class="progress-ring-bg"
        :cx="center"
        :cy="center"
        :r="radius"
      />
      <circle
        class="progress-ring-circle"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="modeColor"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
      />
    </svg>
    <div class="timer-content">
      <div class="timer-text">{{ formattedTime }}</div>
      <div class="timer-mode">{{ modeLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  time: number
  totalTime: number
  mode: 'work' | 'shortBreak' | 'longBreak'
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 300
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size / 2) - 20)
const circumference = computed(() => 2 * Math.PI * radius.value)

const strokeDashoffset = computed(() => {
  const progress = props.time / props.totalTime
  return circumference.value * (1 - progress)
})

const formattedTime = computed(() => {
  const minutes = Math.floor(props.time / 60)
  const seconds = props.time % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const modeLabel = computed(() => {
  switch (props.mode) {
    case 'work': return 'Focus'
    case 'shortBreak': return 'Short Break'
    case 'longBreak': return 'Long Break'
  }
})

const modeColor = computed(() => {
  switch (props.mode) {
    case 'work': return '#ef4444'
    case 'shortBreak': return '#22c55e'
    case 'longBreak': return '#3b82f6'
  }
})
</script>

<style scoped>
.timer-display {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: var(--color-border);
  stroke-width: 12;
}

.progress-ring-circle {
  fill: none;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

.timer-content {
  position: absolute;
  text-align: center;
}

.timer-text {
  font-size: 4.5rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--color-text-primary);
}

.timer-mode {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-top: var(--spacing-md);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@media (max-width: 600px) {
  .timer-text {
    font-size: 3.5rem;
  }

  .timer-mode {
    font-size: 0.875rem;
  }
}
</style>

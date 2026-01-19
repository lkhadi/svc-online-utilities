<template>
  <div class="timer-controls">
    <div class="mode-switcher">
      <button
        v-for="m in modes"
        :key="m.id"
        class="mode-btn"
        :class="{ active: mode === m.id }"
        @click="$emit('setMode', m.id)"
      >
        {{ m.label }}
      </button>
    </div>

    <div class="control-buttons">
      <button
        class="control-btn control-btn-primary"
        :class="{ paused: isPaused }"
        @click="$emit('toggle')"
      >
        <span v-if="isPaused" class="play-icon">▶</span>
        <span v-else class="pause-icon">⏸</span>
        {{ isPaused ? 'Start' : 'Pause' }}
      </button>

      <button class="control-btn control-btn-secondary" @click="$emit('reset')">
        <span class="reset-icon">↺</span>
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mode: 'work' | 'shortBreak' | 'longBreak'
  isPaused: boolean
}

defineProps<Props>()

defineEmits<{
  setMode: [mode: 'work' | 'shortBreak' | 'longBreak']
  toggle: []
  reset: []
}>()

const modes = [
  { id: 'work' as const, label: 'Work' },
  { id: 'shortBreak' as const, label: 'Short Break' },
  { id: 'longBreak' as const, label: 'Long Break' }
]
</script>

<style scoped>
.timer-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.mode-switcher {
  display: flex;
  gap: var(--spacing-sm);
  background: var(--color-bg-secondary);
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
}

.mode-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.mode-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-glass);
}

.mode-btn.active {
  background: var(--color-accent-primary);
  color: white;
  font-weight: 600;
}

.control-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.control-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-2xl);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.control-btn-primary {
  background: var(--color-accent-primary);
  color: white;
}

.control-btn-primary:hover {
  background: var(--color-accent-primary-hover);
}

.control-btn-primary.paused {
  background: #22c55e;
}

.control-btn-primary.paused:hover {
  background: #16a34a;
}

.control-btn-secondary {
  background: var(--color-bg-glass);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.control-btn-secondary:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.play-icon,
.pause-icon,
.reset-icon {
  font-size: 1.25rem;
}

@media (max-width: 600px) {
  .control-btn {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-sm);
  }

  .mode-btn {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-xs);
  }
}
</style>

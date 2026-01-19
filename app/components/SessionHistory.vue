<template>
  <div class="session-history">
    <div class="history-header">
      <h3>Session History</h3>
      <button v-if="sessions.length > 0" class="clear-btn" @click="$emit('clear')">
        Clear
      </button>
    </div>

    <div v-if="sessions.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <p>No sessions yet</p>
    </div>

    <div v-else class="sessions-list">
      <div class="sessions-dots">
        <div
          v-for="(_, index) in 4"
          :key="index"
          class="session-dot"
          :class="{ completed: index < sessions.length % 4 || index < 4 && sessions.length >= 4 }"
        ></div>
      </div>

      <div class="sessions-items">
        <div
          v-for="session in sessions.slice().reverse()"
          :key="session.id"
          class="session-item"
        >
          <div class="session-info">
            <span class="session-mode" :class="session.mode">
              {{ modeLabel(session.mode) }}
            </span>
            <span class="session-duration">{{ session.duration }} min</span>
          </div>
          <span class="session-time">{{ formatTime(session.timestamp) }}</span>
        </div>
      </div>

      <div class="sessions-summary">
        <div class="summary-item">
          <span class="summary-label">Total Focus Time</span>
          <span class="summary-value">{{ totalFocusTime }} min</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Sessions Completed</span>
          <span class="summary-value">{{ sessions.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Session {
  id: string
  mode: 'work' | 'shortBreak' | 'longBreak'
  duration: number
  timestamp: number
}

interface Props {
  sessions: Session[]
}

defineProps<Props>()

defineEmits<{
  clear: []
}>()

const modeLabel = (mode: string) => {
  switch (mode) {
    case 'work': return 'Focus'
    case 'shortBreak': return 'Short Break'
    case 'longBreak': return 'Long Break'
  }
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${date.getDate()}/${date.getMonth() + 1}`
}

const totalFocusTime = computed(() => {
  return props.sessions
    .filter(s => s.mode === 'work')
    .reduce((sum, s) => sum + s.duration, 0)
})
</script>

<style scoped>
.session-history {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.history-header h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.clear-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.clear-btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-text-secondary);
}

.empty-state {
  padding: var(--spacing-3xl) var(--spacing-xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
  opacity: 0.5;
}

.empty-state p {
  font-size: var(--font-size-sm);
  margin: 0;
}

.sessions-list {
  padding: var(--spacing-lg);
}

.sessions-dots {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.session-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-border);
  transition: all var(--transition-base);
}

.session-dot.completed {
  background: var(--color-accent-primary);
}

.sessions-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: var(--spacing-lg);
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.session-item:last-child {
  margin-bottom: 0;
}

.session-info {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.session-mode {
  padding: 2px 8px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.session-mode.work {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.session-mode.shortBreak {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.session-mode.longBreak {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.session-duration {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.session-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.sessions-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.summary-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.summary-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}

@media (max-width: 600px) {
  .sessions-summary {
    grid-template-columns: 1fr;
  }
}
</style>

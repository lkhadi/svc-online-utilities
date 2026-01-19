<template>
  <div class="timer-settings">
    <div class="settings-header">
      <h3>Timer Settings</h3>
      <button class="toggle-btn" @click="expanded = !expanded">
        {{ expanded ? '−' : '+' }}
      </button>
    </div>

    <div v-if="expanded" class="settings-content">
      <div class="setting-row">
        <label>Work Duration</label>
        <div class="time-input">
          <input
            type="number"
            v-model.number="settings.work"
            min="1"
            max="60"
            @change="$emit('update:work', settings.work)"
          >
          <span>min</span>
        </div>
      </div>

      <div class="setting-row">
        <label>Short Break</label>
        <div class="time-input">
          <input
            type="number"
            v-model.number="settings.shortBreak"
            min="1"
            max="30"
            @change="$emit('update:shortBreak', settings.shortBreak)"
          >
          <span>min</span>
        </div>
      </div>

      <div class="setting-row">
        <label>Long Break</label>
        <div class="time-input">
          <input
            type="number"
            v-model.number="settings.longBreak"
            min="1"
            max="60"
            @change="$emit('update:longBreak', settings.longBreak)"
          >
          <span>min</span>
        </div>
      </div>

      <div class="setting-row">
        <label>Sessions until Long Break</label>
        <div class="time-input">
          <input
            type="number"
            v-model.number="settings.longBreakInterval"
            min="2"
            max="10"
            @change="$emit('update:longBreakInterval', settings.longBreakInterval)"
          >
          <span>sessions</span>
        </div>
      </div>

      <div class="setting-row">
        <label>Sound Notification</label>
        <button
          class="toggle-switch"
          :class="{ active: settings.soundEnabled }"
          @click="toggleSound"
        >
          <span class="toggle-slider"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  work: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
  soundEnabled: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:work': [value: number]
  'update:shortBreak': [value: number]
  'update:longBreak': [value: number]
  'update:longBreakInterval': [value: number]
  'update:soundEnabled': [value: boolean]
}>()

const expanded = ref(false)

const settings = computed(() => ({
  work: props.work,
  shortBreak: props.shortBreak,
  longBreak: props.longBreak,
  longBreakInterval: props.longBreakInterval,
  soundEnabled: props.soundEnabled
}))

const toggleSound = () => {
  emit('update:soundEnabled', !props.soundEnabled)
}
</script>

<style scoped>
.timer-settings {
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: background var(--transition-base);
}

.settings-header:hover {
  background: var(--color-bg-hover);
}

.settings-header h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.toggle-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.toggle-btn:hover {
  background: var(--color-bg-hover);
}

.settings-content {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.setting-row:last-child {
  margin-bottom: 0;
}

.setting-row label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.time-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.time-input input {
  width: 80px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  text-align: center;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.time-input input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.time-input span {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.toggle-switch {
  width: 48px;
  height: 24px;
  background: var(--color-border);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  padding: 2px;
  transition: all var(--transition-base);
}

.toggle-switch.active {
  background: var(--color-accent-primary);
}

.toggle-slider {
  display: block;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-base);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(24px);
}

@media (max-width: 600px) {
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .time-input {
    width: 100%;
  }

  .time-input input {
    width: 100%;
  }
}
</style>

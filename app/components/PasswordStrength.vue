<template>
  <div class="password-strength" v-if="password">
    <div class="strength-meter">
      <div 
        class="strength-bar"
        :class="strengthClass"
        :style="{ width: strengthPercentage + '%' }"
      ></div>
    </div>
    <div class="strength-info">
      <span class="strength-label" :class="strengthClass">
        {{ strengthLabel }}
      </span>
      <span class="strength-hint" v-if="strengthLevel < 4">
        {{ strengthHint }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  password: string
}>()

const strengthLevel = computed(() => {
  if (!props.password) return 0

  let score = 0
  const password = props.password

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  return Math.min(score, 5)
})

const strengthClass = computed(() => {
  switch (strengthLevel.value) {
    case 0:
    case 1:
      return 'weak'
    case 2:
      return 'fair'
    case 3:
      return 'good'
    case 4:
      return 'strong'
    case 5:
      return 'very-strong'
    default:
      return 'weak'
  }
})

const strengthLabel = computed(() => {
  switch (strengthLevel.value) {
    case 0:
      return 'Too Short'
    case 1:
      return 'Weak'
    case 2:
      return 'Fair'
    case 3:
      return 'Good'
    case 4:
      return 'Strong'
    case 5:
      return 'Very Strong'
    default:
      return 'Weak'
  }
})

const strengthPercentage = computed(() => {
  switch (strengthLevel.value) {
    case 0:
      return 20
    case 1:
      return 40
    case 2:
      return 60
    case 3:
      return 80
    case 4:
      return 100
    case 5:
      return 100
    default:
      return 20
  }
})

const strengthHint = computed(() => {
  const password = props.password
  const hints = []

  if (password.length < 8) {
    hints.push('Use at least 8 characters')
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    hints.push('Mix uppercase and lowercase')
  }
  if (!/\d/.test(password)) {
    hints.push('Add numbers')
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    hints.push('Include special characters')
  }

  return hints.length > 0 ? hints.join(' • ') : ''
})
</script>

<style scoped>
.password-strength {
  margin-top: 0.75rem;
}

.strength-meter {
  height: 6px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-bar.weak {
  background: #ef4444;
}

.strength-bar.fair {
  background: #f97316;
}

.strength-bar.good {
  background: #eab308;
}

.strength-bar.strong {
  background: #84cc16;
}

.strength-bar.very-strong {
  background: #22c55e;
}

.strength-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.strength-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: capitalize;
}

.strength-label.weak {
  color: #ef4444;
}

.strength-label.fair {
  color: #f97316;
}

.strength-label.good {
  color: #eab308;
}

.strength-label.strong {
  color: #84cc16;
}

.strength-label.very-strong {
  color: #22c55e;
}

.strength-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .strength-info {
    flex-direction: column;
  }
}
</style>

<template>
  <div class="utility-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <header class="utility-header">
        <span class="utility-tag">Tools</span>
        <h1 class="utility-title">Lorem Ipsum Generator</h1>
        <p class="utility-description">
          Generate placeholder text for your designs and prototypes
        </p>
      </header>

      <div class="utility-card">
        <div class="form-group" style="display: flex; align-items: center; gap: 1rem;">
          <label for="paragraphs" style="margin-bottom: 0;">Paragraphs:</label>
          <input 
            type="number" 
            id="paragraphs" 
            class="num-input" 
            v-model.number="paragraphCount"
            min="1" 
            max="20"
          >
          <button class="btn btn-primary" @click="generate">Generate</button>
          <button class="btn btn-secondary" @click="copyOutput" :disabled="!output">Copy</button>
        </div>
        
        <div class="form-group" style="margin-top: 1.5rem;">
          <textarea 
            class="textarea-input" 
            v-model="output"
            rows="12"
            readonly
            placeholder="Generated Lorem Ipsum will appear here"
          ></textarea>
        </div>
      </div>

      <section class="info-section">
        <h2>About Lorem Ipsum</h2>
        <p>
          Lorem Ipsum is dummy text used in the printing and typesetting industry. 
          It helps designers visualize layout and typography before the final content is ready.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Lorem Ipsum Generator - meskipun.win',
  description: 'Generate Lorem Ipsum placeholder text for your designs.',
})

const { copy } = useClipboard()
const { show } = useNotification()

const paragraphCount = ref(3)
const output = ref('')

const LOREM_PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisi nisl aliquam eros, a malesuada dui sapien ut nulla.",
  "Suspendisse potenti. Proin commodo, massa eu facilisis gravida, justo velit pretium sem, quis porta augue sem eget erat.",
  "Mauris placerat, quam in mattis laoreet, dui orci dictum urna, vitae dictum enim turpis ut leo.",
  "Praesent nec velit at enim feugiat efficitur ac ut erat. Nam euismod, eros ut cursus tincidunt, risus velit euismod nibh, non dictum urna lacus eu enim.",
  "Quisque euismod, ex ut dictum pharetra, orci purus faucibus erat, sit amet pretium tellus sapien eu est.",
  "Etiam at turpis eu elit cursus tempus. Pellentesque et scelerisque sem, eu gravida velit.",
  "Vivamus dictum arcu nec tortor cursus, eget maximus lorem dictum. Proin sodales sem in cursus cursus.",
  "Donec nec lorem non urna facilisis cursus. Morbi accumsan, augue ut mollis tempus, sem massa pretium ex, ac iaculis velit enim ac urna.",
  "Phasellus ac orci id nulla luctus molestie. Curabitur maximus, erat in efficitur cursus, massa enim mollis arcu, at scelerisque libero tellus a felis.",
  "Sed ac massa ut urna feugiat scelerisque. Quisque gravida dictum nisi, in dictum erat dictum in."
]

function generate() {
  const count = Math.max(1, Math.min(20, paragraphCount.value || 1))
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(LOREM_PARAGRAPHS[i % LOREM_PARAGRAPHS.length])
  }
  output.value = result.join('\n\n')
}

async function copyOutput() {
  if (!output.value) return
  const success = await copy(output.value)
  show(success ? 'Copied to clipboard' : 'Copy failed', success ? 'success' : 'error')
}
</script>

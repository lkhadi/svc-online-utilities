<template>
  <footer class="footer">
    <div class="container footer-container">
      <div class="footer-brand">
        <span class="brand-icon">🚀</span>
        <span class="brand-text">meskipun<span class="brand-accent">.win</span></span>
      </div>
      
      <p class="footer-copyright">
        © {{ currentYear }} <a href="https://github.com/lkhadi" target="_blank" rel="noopener">lkhadi</a>. All rights reserved.
        <span class="mx-2">•</span>
        <NuxtLink to="/about">About Us</NuxtLink>
        <span class="mx-2">•</span>
        <NuxtLink to="/contact">Contact</NuxtLink>
        <span class="mx-2">•</span>
        <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
        <span class="mx-2">•</span>
        <NuxtLink to="/terms">Terms of Service</NuxtLink>
      </p>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-xl) 0;
  margin-top: auto;
}

.footer-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.brand-icon {
  font-size: 1.25rem;
}

.brand-text {
  color: var(--color-text-primary);
}

.brand-accent {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-copyright {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.footer-copyright a {
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.footer-copyright a:hover {
  color: var(--color-accent-primary);
}

.mx-2 {
  margin: 0 var(--spacing-sm);
}

@media (max-width: 640px) {
  .footer-container {
    flex-direction: column;
    text-align: center;
  }
}
</style>

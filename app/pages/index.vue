<template>
  <div class="landing-page">
    <HeroSection />
    
    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Features</span>
          <h2 class="section-title">Everything in One Place</h2>
          <p class="section-description">
            Explore articles, tools, and games — all free and accessible.
          </p>
        </div>
        
        <div class="features-grid">
          <FeatureCard
            v-for="feature in features"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
            :link="feature.link"
            :tools="feature.tools"
            :gradient="feature.gradient"
          />
        </div>
      </div>
    </section>
    
    <section class="cta-section">
      <div class="container">
        <div class="cta-card glass">
          <div class="cta-glow"></div>
          <div class="cta-content">
            <h2 class="cta-title">Ready to Explore?</h2>
            <p class="cta-description">
              All features are free to use. No sign-up required.
            </p>
            <a href="/tools" class="btn btn-primary btn-lg">
              Try Our Tools
              <span class="btn-icon">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const features = [
  {
    icon: '📝',
    title: 'Blog',
    description: 'Read interesting articles on various topics. Personal stories, tips, tutorials, and random thoughts.',
    link: '#',
    tools: ['Coming Soon'],
    gradient: 'primary'
  },
  {
    icon: '🛠️',
    title: 'Tools',
    description: 'A suite of helpful tools including UUID generators, hash generators, converters, and more.',
    link: '/tools',
    tools: ['UUID v7', 'Bcrypt', 'Base64', 'Lorem Ipsum'],
    gradient: 'secondary'
  },
  {
    icon: '🎮',
    title: 'Games',
    description: 'Take a break and enjoy fun HTML5 games. Classic arcade games, puzzles, and more—all playable in your browser.',
    link: '#',
    tools: ['Coming Soon'],
    gradient: 'accent'
  },
]
</script>

<style scoped>
.landing-page {
  overflow: hidden;
}

/* Features Section */
.features-section {
  padding: var(--spacing-4xl) 0;
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.section-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.02em;
}

.section-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 500px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-xl);
}

/* CTA Section */
.cta-section {
  padding: var(--spacing-4xl) 0;
}

.cta-card {
  position: relative;
  padding: var(--spacing-4xl);
  border-radius: var(--radius-2xl);
  text-align: center;
  overflow: hidden;
}

.cta-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent 70%);
  transform: translate(-50%, -50%);
  filter: blur(60px);
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.cta-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 768px) {
  .section-title {
    font-size: var(--font-size-3xl);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-card {
    padding: var(--spacing-2xl);
  }
  
  .cta-title {
    font-size: var(--font-size-2xl);
  }
}
</style>

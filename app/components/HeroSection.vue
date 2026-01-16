<template>
  <section class="hero">
    <div class="hero-bg">
      <div class="hero-glow hero-glow-1"></div>
      <div class="hero-glow hero-glow-2"></div>
      <div class="hero-grid"></div>
    </div>
    
    <div class="container hero-content">
      <div class="hero-badge animate-fade-in-up">
        <span class="badge-dot"></span>
        <span>Your Digital Playground</span>
      </div>
      
      <h1 class="hero-title animate-fade-in-up animate-delay-100">
        Read. <span class="gradient-text">Create.</span><br>
        <span class="gradient-text">Play.</span>
      </h1>
      
      <p class="hero-description animate-fade-in-up animate-delay-200">
        Discover insightful articles, powerful developer tools, and fun games.
        <br>All in one place. Free and always accessible.
      </p>
      
      <div class="hero-actions animate-fade-in-up animate-delay-300">
        <a href="#features" class="btn btn-primary btn-lg">
          Explore Features
          <span class="btn-icon">→</span>
        </a>
        <a href="/tools" class="btn btn-secondary btn-lg">
          Tools
        </a>
      </div>
      
      <div class="hero-stats animate-fade-in-up animate-delay-400">
        <div class="stat">
          <span class="stat-value">📝</span>
          <span class="stat-label">Blog</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">🛠️</span>
          <span class="stat-label">Utilities</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">🎮</span>
          <span class="stat-label">Games</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: calc(100vh - var(--nav-height));
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.6;
}

.hero-glow-1 {
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
  animation: pulse-glow 8s ease-in-out infinite;
}

.hero-glow-2 {
  bottom: -20%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.12), transparent 70%);
  animation: pulse-glow 10s ease-in-out infinite reverse;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: var(--spacing-4xl) 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--color-accent-secondary);
  border-radius: 50%;
  animation: pulse-glow 2s ease-in-out infinite;
  box-shadow: 0 0 10px var(--color-accent-secondary);
}

.hero-title {
  font-size: var(--font-size-6xl);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-xl);
}

.hero-description {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto var(--spacing-2xl);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-3xl);
}

.btn-icon {
  transition: transform var(--transition-fast);
}

.btn:hover .btn-icon {
  transform: translateX(4px);
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--font-size-4xl);
  }
  
  .hero-description {
    font-size: var(--font-size-lg);
  }
  
  .hero-stats {
    gap: var(--spacing-lg);
  }
  
  .stat-divider {
    display: none;
  }
}
</style>

<template>
  <div class="bg-white py-12 sm:py-16">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-3xl">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">About Us</h1>
        
        <div class="prose prose-lg prose-indigo text-gray-500">
          <p class="lead">
            Welcome to meskipun.win, your go-to destination for free online tools, games, and insightful articles.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is to provide high-quality, accessible, and useful web utilities to everyone. Whether you're a developer needing a quick UUID generator, a designer looking for color inspiration, or just someone looking to pass the time with a classic game, we have something for you.
          </p>

          <h2>What We Offer</h2>
          <ul>
            <li><strong>Tools:</strong> A growing collection of developer and productivity tools including PDF converters, image tools, and code generators.</li>
            <li><strong>Games:</strong> Classic and fun games to relax and enjoy directly in your browser without downloads.</li>
            <li><strong>Blog:</strong> Articles covering technology trends, tutorials, and insights.</li>
          </ul>

          <h2>Our Values</h2>
          <p>
            We believe in specific values:
          </p>
          <ul>
            <li><strong>Simplicity:</strong> Tools should be easy to use and intuitive.</li>
            <li><strong>Privacy:</strong> We respect your data. Most of our tools run entirely client-side.</li>
            <li><strong>Accessibility:</strong> We strive to make our content available to everyone.</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            Have a suggestion, found a bug, or just want to say hi? We'd love to hear from you. Visit our <NuxtLink to="/contact">Contact Page</NuxtLink> to get in touch.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'About Us - meskipun.win',
  description: 'Learn more about meskipun.win, our mission, and the free tools and games we provide.',
})
</script>

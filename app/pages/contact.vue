<template>
  <div class="bg-white py-12 sm:py-16">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-3xl">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">Contact Us</h1>
        
        <div class="prose prose-lg prose-indigo text-gray-500 mb-8">
          <p class="lead">
            We're here to help! If you have any questions, suggestions, or feedback, please don't hesitate to reach out.
          </p>
        </div>

        <form class="space-y-6" @submit.prevent="submitForm">
          <div>
            <label for="name" class="block text-sm font-medium leading-6 text-gray-900">Name</label>
            <div class="mt-2">
              <input type="text" name="name" id="name" autocomplete="name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2" placeholder="Your Name">
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email</label>
            <div class="mt-2">
              <input type="email" name="email" id="email" autocomplete="email" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2" placeholder="you@example.com">
            </div>
          </div>

          <div>
            <label for="message" class="block text-sm font-medium leading-6 text-gray-900">Message</label>
            <div class="mt-2">
              <textarea id="message" name="message" rows="4" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2" placeholder="How can we help you?"></textarea>
            </div>
          </div>

          <div>
            <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Send Message</button>
          </div>
        </form>

        <div class="mt-12">
            <h2 class="text-xl font-bold text-gray-900">Other ways to contact us</h2>
            <p class="mt-2 text-gray-600">
                Email: support@meskipun.win
            </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Contact Us - meskipun.win',
  description: 'Get in touch with the team behind meskipun.win.',
})

const submitForm = () => {
  // Logic to handle form submission would go here
  alert('Thank you for your message! This is a demo form.');
}
</script>

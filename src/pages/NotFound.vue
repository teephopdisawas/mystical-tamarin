<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <div class="text-center px-4">
      <div class="mx-auto w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-violet-500/25 mb-8">
        <span class="text-4xl font-bold text-white">404</span>
      </div>
      <h1 class="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">Page Not Found</h1>
      <p class="text-lg text-muted-foreground mb-8 max-w-md mx-auto">Oops! The page you're looking for doesn't exist or has been moved.</p>
      <router-link 
        to="/" 
        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Return to Home
      </router-link>
    </div>
  </div>
</template>

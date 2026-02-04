<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/integrations/supabase/client'
import type { Session } from '@supabase/supabase-js'

const router = useRouter()
const session = ref<Session | null>(null)
const loading = ref(true)

let subscription: { unsubscribe: () => void } | null = null

onMounted(async () => {
  // Get initial session
  const { data } = await supabase.auth.getSession()
  session.value = data.session
  loading.value = false

  // Listen for auth changes
  const { data: authData } = supabase.auth.onAuthStateChange((_event, sess) => {
    session.value = sess
    loading.value = false
  })
  subscription = authData.subscription
})

onUnmounted(() => {
  subscription?.unsubscribe()
})

watch([session, loading], ([sess, load]) => {
  if (!load) {
    if (sess) {
      console.log('User is logged in, redirecting to dashboard.')
      router.push('/dashboard')
    } else {
      console.log('User is not logged in, redirecting to login.')
      router.push('/login')
    }
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <div class="text-center">
      <div class="mx-auto w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/25 mb-6 animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h1 class="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">Loading Portal...</h1>
      <p class="text-lg text-muted-foreground">Checking authentication status</p>
      <div class="mt-6 w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  </div>
</template>

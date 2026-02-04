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
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">Loading Portal...</h1>
      <p class="text-xl text-gray-600">Checking authentication status.</p>
    </div>
  </div>
</template>

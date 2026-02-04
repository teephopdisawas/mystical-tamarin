<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/integrations/supabase/client'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { showSuccess, showError } from '@/utils/toast'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const isSignUp = ref(false)

let subscription: { unsubscribe: () => void } | null = null

onMounted(() => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      router.push('/dashboard')
    }
  })
  subscription = data.subscription
})

onUnmounted(() => {
  subscription?.unsubscribe()
})

const handleSubmit = async () => {
  loading.value = true
  
  try {
    if (isSignUp.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      showSuccess('Check your email for the confirmation link!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      showSuccess('Logged in successfully!')
    }
  } catch (error: any) {
    showError(error.message || 'An error occurred')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <div class="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 mx-4">
      <!-- Logo/Icon -->
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>
        <h2 class="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          {{ isSignUp ? 'Create Account' : 'Welcome Back' }}
        </h2>
        <p class="text-muted-foreground mt-2">
          {{ isSignUp ? 'Start your journey with us' : 'Sign in to your portal' }}
        </p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="space-y-2">
          <Label for="email" class="text-sm font-medium text-foreground">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            class="h-12 bg-white/50 border-slate-200 focus:border-violet-500 transition-colors"
          />
        </div>
        
        <div class="space-y-2">
          <Label for="password" class="text-sm font-medium text-foreground">Password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            class="h-12 bg-white/50 border-slate-200 focus:border-violet-500 transition-colors"
          />
        </div>
        
        <Button 
          type="submit" 
          class="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-violet-500/25 transition-all duration-200" 
          :disabled="loading"
        >
          {{ loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In') }}
        </Button>
      </form>
      
      <div class="text-center pt-2">
        <button
          type="button"
          class="text-sm text-violet-600 hover:text-violet-700 font-medium hover:underline transition-colors"
          @click="isSignUp = !isSignUp"
        >
          {{ isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
        </button>
      </div>
    </div>
  </div>
</template>

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
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
      <h2 class="text-2xl font-bold text-center text-gray-900">
        {{ isSignUp ? 'Create an account' : 'Sign in to your portal' }}
      </h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        
        <div class="space-y-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        
        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In') }}
        </Button>
      </form>
      
      <div class="text-center">
        <button
          type="button"
          class="text-sm text-blue-600 hover:underline"
          @click="isSignUp = !isSignUp"
        >
          {{ isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
        </button>
      </div>
    </div>
  </div>
</template>

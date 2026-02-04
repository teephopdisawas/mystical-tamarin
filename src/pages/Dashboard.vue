<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/integrations/supabase/client'
import Sidebar from '@/components/Sidebar.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { showSuccess, showError } from '@/utils/toast'
import type { User } from '@supabase/supabase-js'

const router = useRouter()
const user = ref<User | null>(null)
const profile = ref<{ first_name: string | null; last_name: string | null } | null>(null)
const loading = ref(true)
const firstName = ref('')
const lastName = ref('')

let subscription: { unsubscribe: () => void } | null = null

const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    showError('Failed to load profile data.')
    profile.value = null
  } else if (data) {
    profile.value = data
    firstName.value = data.first_name || ''
    lastName.value = data.last_name || ''
  }
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  if (currentUser) {
    user.value = currentUser
    await fetchProfile(currentUser.id)
  } else {
    router.push('/login')
  }
  loading.value = false

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      router.push('/login')
    } else {
      user.value = session.user
      fetchProfile(session.user.id)
    }
  })
  subscription = data.subscription
})

onUnmounted(() => {
  subscription?.unsubscribe()
})

const handleUpdateProfile = async () => {
  if (!user.value) return

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName.value,
      last_name: lastName.value,
    })
    .eq('id', user.value.id)

  if (error) {
    console.error('Error updating profile:', error)
    showError('Failed to update profile.')
  } else {
    showSuccess('Profile updated successfully!')
    fetchProfile(user.value.id)
  }
}

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Logout error:', error)
    showError('Failed to log out.')
  }
}

const displayName = computed(() => {
  return profile.value?.first_name || user.value?.email || 'User'
})
</script>

<template>
  <div v-if="loading || !user" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-muted-foreground">Loading...</p>
    </div>
  </div>
  <div v-else class="flex min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <Sidebar :show-logout="true" @logout="handleLogout" />
    
    <div class="flex-1 p-8 overflow-y-auto">
      <!-- Welcome Section -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Online
        </div>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
          Welcome back, {{ displayName }}!
        </h1>
        <p class="text-lg text-muted-foreground max-w-xl mx-auto">
          {{ user?.email }}
        </p>
      </div>

      <!-- Profile Card -->
      <div class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 max-w-lg mx-auto mb-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-foreground">Update Profile</h2>
            <p class="text-muted-foreground text-sm">Manage your personal information</p>
          </div>
        </div>
        <form @submit.prevent="handleUpdateProfile" class="space-y-5">
          <div class="space-y-2">
            <Label for="first_name" class="text-sm font-medium">First Name</Label>
            <Input
              id="first_name"
              v-model="firstName"
              placeholder="First Name"
              class="h-12 bg-white/50 border-slate-200 focus:border-violet-500 transition-colors"
            />
          </div>
          <div class="space-y-2">
            <Label for="last_name" class="text-sm font-medium">Last Name</Label>
            <Input
              id="last_name"
              v-model="lastName"
              placeholder="Last Name"
              class="h-12 bg-white/50 border-slate-200 focus:border-violet-500 transition-colors"
            />
          </div>
          <Button 
            type="submit" 
            class="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-violet-500/25 transition-all"
          >
            Update Profile
          </Button>
        </form>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 max-w-lg mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-foreground">Mini Apps</h2>
            <p class="text-muted-foreground text-sm">Explore your productivity tools</p>
          </div>
        </div>
        <p class="text-slate-600">Use the sidebar to navigate between your mini-apps including Notes, Gallery, Messaging, Calculator, and To-Do List.</p>
      </div>
    </div>
  </div>
</template>

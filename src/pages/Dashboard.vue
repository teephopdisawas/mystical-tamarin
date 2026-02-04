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
  <div v-if="loading || !user" class="flex items-center justify-center min-h-screen">
    Loading...
  </div>
  <div v-else class="flex min-h-screen bg-gray-100">
    <Sidebar :show-logout="true" @logout="handleLogout" />
    
    <div class="flex-1 p-8 overflow-y-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">
          Welcome to Your Portal, {{ displayName }}!
        </h1>
        <p v-if="profile?.first_name && profile?.last_name" class="text-lg text-gray-700">
          ({{ user?.email }})
        </p>
        <p v-if="!profile?.first_name && !profile?.last_name" class="text-lg text-gray-700">
          ({{ user?.email }})
        </p>
        <p class="text-xl text-gray-600 mt-4">This is your central dashboard.</p>
      </div>

      <div class="bg-white p-6 rounded shadow-md max-w-md mx-auto">
        <h2 class="text-2xl font-bold mb-4 text-center">Update Profile</h2>
        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div class="space-y-2">
            <Label for="first_name">First Name</Label>
            <Input
              id="first_name"
              v-model="firstName"
              placeholder="First Name"
            />
          </div>
          <div class="space-y-2">
            <Label for="last_name">Last Name</Label>
            <Input
              id="last_name"
              v-model="lastName"
              placeholder="Last Name"
            />
          </div>
          <Button type="submit" class="w-full">Update Profile</Button>
        </form>
      </div>

      <div class="mt-8 bg-white p-6 rounded shadow-md max-w-md mx-auto text-center">
        <h2 class="text-2xl font-bold mb-4">Mini App Content Area</h2>
        <p class="text-gray-600">This is where content for your mini-apps will appear.</p>
      </div>
    </div>
  </div>
</template>

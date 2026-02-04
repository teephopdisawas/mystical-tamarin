<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import Sidebar from '@/components/Sidebar.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { showError } from '@/utils/toast'
import { Send } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

interface Message {
  id: string
  user_id: string
  content: string
  created_at: string
}

const messages = ref<Message[]>([])
const loading = ref(true)
const user = ref<User | null>(null)
const newMessage = ref('')
const messagesEnd = ref<HTMLElement | null>(null)

let channel: ReturnType<typeof supabase.channel> | null = null

const fetchMessages = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('messages')
    .select('id, user_id, content, created_at')
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Error fetching messages:', error)
    showError('Failed to load messages.')
  } else if (data) {
    messages.value = data
  }
  loading.value = false
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser

  if (currentUser) {
    await fetchMessages()

    // Set up real-time subscription
    channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const { data, error } = await supabase
          .from('messages')
          .select('id, user_id, content, created_at')
          .eq('id', payload.new.id)
          .single()

        if (!error && data) {
          messages.value = [...messages.value, data]
        }
      })
      .subscribe()
  } else {
    loading.value = false
  }
})

onUnmounted(() => {
  channel?.unsubscribe()
})

// Auto-scroll when messages change
watch(messages, async () => {
  await nextTick()
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
})

const handleSendMessage = async () => {
  if (!user.value || !newMessage.value.trim()) {
    return
  }

  const { error } = await supabase
    .from('messages')
    .insert([{
      user_id: user.value.id,
      content: newMessage.value,
    }])

  if (error) {
    console.error('Error sending message:', error)
    showError('Failed to send message.')
  } else {
    newMessage.value = ''
  }
}

const isCurrentUser = (messageUserId: string) => {
  return user.value && messageUserId === user.value.id
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    Loading messages...
  </div>
  <div v-else-if="!user" class="flex items-center justify-center min-h-screen">
    Please log in to view messages.
  </div>
  <div v-else class="flex min-h-screen bg-gray-100">
    <Sidebar />
    
    <div class="flex-1 p-8 flex flex-col h-screen">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">Public Chat</h1>
        <p class="text-xl text-gray-600 mt-4">Chat with other logged-in users.</p>
      </div>

      <!-- Message Display Area -->
      <div class="flex-1 overflow-y-auto p-4 bg-white rounded shadow-md mb-4 space-y-4">
        <p v-if="messages.length === 0" class="text-center text-gray-600">
          No messages yet. Send one below!
        </p>
        <div
          v-for="message in messages"
          :key="message.id"
          :class="cn(
            'flex items-start space-x-3',
            isCurrentUser(message.user_id) ? 'justify-end' : 'justify-start'
          )"
        >
          <div
            :class="cn(
              'max-w-xs p-3 rounded-lg',
              isCurrentUser(message.user_id)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-800'
            )"
          >
            <p class="text-sm font-semibold mb-1">
              User ID: {{ message.user_id.slice(0, 8) }}...
            </p>
            <p>{{ message.content }}</p>
            <p class="text-xs mt-1 opacity-75">
              {{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>
        </div>
        <div ref="messagesEnd"></div>
      </div>

      <!-- New Message Form -->
      <div class="bg-white p-4 rounded shadow-md">
        <form @submit.prevent="handleSendMessage" class="flex space-x-2">
          <Input
            v-model="newMessage"
            placeholder="Type your message..."
            class="flex-1"
          />
          <Button type="submit" size="icon">
            <Send class="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

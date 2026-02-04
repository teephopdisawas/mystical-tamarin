<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import Sidebar from '@/components/Sidebar.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { showError } from '@/utils/toast'
import { Send, MessageCircle } from 'lucide-vue-next'
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
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-muted-foreground">Loading messages...</p>
    </div>
  </div>
  <div v-else-if="!user" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <p class="text-muted-foreground">Please log in to view messages.</p>
  </div>
  <div v-else class="flex min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <Sidebar />
    
    <div class="flex-1 p-8 flex flex-col h-screen">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
          <MessageCircle class="w-4 h-4" />
          Public Chat
        </div>
        <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
          Public Chat
        </h1>
        <p class="text-muted-foreground">Chat with other logged-in users</p>
      </div>

      <!-- Message Display Area -->
      <div class="flex-1 overflow-y-auto p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-6 space-y-4">
        <p v-if="messages.length === 0" class="text-center text-muted-foreground py-12">
          No messages yet. Send one below!
        </p>
        <div
          v-for="message in messages"
          :key="message.id"
          :class="cn(
            'flex items-start gap-3',
            isCurrentUser(message.user_id) ? 'justify-end' : 'justify-start'
          )"
        >
          <div
            :class="cn(
              'max-w-sm p-4 rounded-2xl shadow-md',
              isCurrentUser(message.user_id)
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-md'
                : 'bg-white text-slate-800 border border-slate-100 rounded-bl-md'
            )"
          >
            <p class="text-xs font-semibold mb-2 opacity-75">
              {{ isCurrentUser(message.user_id) ? 'You' : `User: ${message.user_id.slice(0, 8)}...` }}
            </p>
            <p class="leading-relaxed">{{ message.content }}</p>
            <p class="text-xs mt-2 opacity-60">
              {{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>
        </div>
        <div ref="messagesEnd"></div>
      </div>

      <!-- New Message Form -->
      <div class="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20">
        <form @submit.prevent="handleSendMessage" class="flex gap-3">
          <Input
            v-model="newMessage"
            placeholder="Type your message..."
            class="flex-1 h-12 bg-white/50 border-slate-200 focus:border-blue-500 transition-colors"
          />
          <Button type="submit" size="icon" class="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25">
            <Send class="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

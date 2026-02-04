<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import Sidebar from '@/components/Sidebar.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { showSuccess, showError } from '@/utils/toast'
import { Trash2, Edit } from 'lucide-vue-next'
import type { User } from '@supabase/supabase-js'

interface Note {
  id: string
  user_id: string
  title: string
  content: string | null
  created_at: string
}

const notes = ref<Note[]>([])
const loading = ref(true)
const user = ref<User | null>(null)
const newTitle = ref('')
const newContent = ref('')
const editingNote = ref<Note | null>(null)
const isEditDialogOpen = ref(false)
const editTitle = ref('')
const editContent = ref('')

const fetchNotes = async () => {
  if (!user.value) return
  
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes:', error)
    showError('Failed to load notes.')
  } else if (data) {
    notes.value = data
  }
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser

  if (currentUser) {
    await fetchNotes()
  }
  loading.value = false
})

const handleCreateNote = async () => {
  if (!user.value || !newTitle.value.trim()) {
    showError('Title is required.')
    return
  }

  const { data, error } = await supabase
    .from('notes')
    .insert([{
      user_id: user.value.id,
      title: newTitle.value,
      content: newContent.value,
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating note:', error)
    showError('Failed to create note.')
  } else if (data) {
    showSuccess('Note created successfully!')
    notes.value = [data, ...notes.value]
    newTitle.value = ''
    newContent.value = ''
  }
}

const handleDeleteNote = async (noteId: string) => {
  if (!user.value) return
  
  if (window.confirm('Are you sure you want to delete this note?')) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.value.id)

    if (error) {
      console.error('Error deleting note:', error)
      showError('Failed to delete note.')
    } else {
      showSuccess('Note deleted successfully!')
      notes.value = notes.value.filter(note => note.id !== noteId)
    }
  }
}

const handleEditClick = (note: Note) => {
  editingNote.value = note
  editTitle.value = note.title
  editContent.value = note.content || ''
  isEditDialogOpen.value = true
}

const handleEditSubmit = async () => {
  if (!user.value || !editingNote.value) return

  const { data, error } = await supabase
    .from('notes')
    .update({
      title: editTitle.value,
      content: editContent.value,
    })
    .eq('id', editingNote.value.id)
    .eq('user_id', user.value.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating note:', error)
    showError('Failed to update note.')
  } else if (data) {
    showSuccess('Note updated successfully!')
    notes.value = notes.value.map(note => note.id === data.id ? data : note)
    isEditDialogOpen.value = false
    editingNote.value = null
  }
}

const handleCloseDialog = () => {
  isEditDialogOpen.value = false
  editingNote.value = null
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    Loading notes...
  </div>
  <div v-else-if="!user" class="flex items-center justify-center min-h-screen">
    Please log in to view notes.
  </div>
  <div v-else class="flex min-h-screen bg-gray-100">
    <Sidebar />
    
    <div class="flex-1 p-8 overflow-y-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">Your Notes</h1>
        <p class="text-xl text-gray-600 mt-4">Create and manage your personal notes.</p>
      </div>

      <!-- New Note Form -->
      <div class="bg-white p-6 rounded shadow-md max-w-md mx-auto mb-8">
        <h2 class="text-2xl font-bold mb-4 text-center">Create New Note</h2>
        <form @submit.prevent="handleCreateNote" class="space-y-4">
          <div class="space-y-2">
            <Label for="title">Title</Label>
            <Input id="title" v-model="newTitle" placeholder="Note Title" />
          </div>
          <div class="space-y-2">
            <Label for="content">Content (Optional)</Label>
            <Textarea id="content" v-model="newContent" placeholder="Note content..." />
          </div>
          <Button type="submit" class="w-full">Save Note</Button>
        </form>
      </div>

      <!-- Notes List -->
      <div class="max-w-md mx-auto space-y-4">
        <p v-if="notes.length === 0" class="text-center text-gray-600">
          No notes yet. Create one above!
        </p>
        <Card v-for="note in notes" :key="note.id">
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>{{ note.title }}</CardTitle>
            <div class="flex space-x-2">
              <Button variant="outline" size="icon" @click="handleEditClick(note)">
                <Edit class="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" @click="handleDeleteNote(note.id)">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p>{{ note.content }}</p>
            <p class="text-sm text-gray-500 mt-2">
              Created: {{ new Date(note.created_at).toLocaleDateString() }}
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Edit Dialog -->
      <div v-if="isEditDialogOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 class="text-xl font-bold mb-4">Edit Note</h2>
          <form @submit.prevent="handleEditSubmit" class="space-y-4">
            <div class="space-y-2">
              <Label for="edit-title">Title</Label>
              <Input id="edit-title" v-model="editTitle" placeholder="Note Title" />
            </div>
            <div class="space-y-2">
              <Label for="edit-content">Content (Optional)</Label>
              <Textarea id="edit-content" v-model="editContent" placeholder="Note content..." />
            </div>
            <div class="flex space-x-2 justify-end">
              <Button type="button" variant="outline" @click="handleCloseDialog">Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

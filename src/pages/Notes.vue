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
import { Trash2, Edit, StickyNote } from 'lucide-vue-next'
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
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-muted-foreground">Loading notes...</p>
    </div>
  </div>
  <div v-else-if="!user" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <p class="text-muted-foreground">Please log in to view notes.</p>
  </div>
  <div v-else class="flex min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <Sidebar />
    
    <div class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
          <StickyNote class="w-4 h-4" />
          Notes
        </div>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-3">
          Your Notes
        </h1>
        <p class="text-lg text-muted-foreground">Create and manage your personal notes</p>
      </div>

      <!-- New Note Form -->
      <div class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 max-w-lg mx-auto mb-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Edit class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-foreground">Create New Note</h2>
            <p class="text-muted-foreground text-sm">Write down your thoughts</p>
          </div>
        </div>
        <form @submit.prevent="handleCreateNote" class="space-y-4">
          <div class="space-y-2">
            <Label for="title" class="text-sm font-medium">Title</Label>
            <Input id="title" v-model="newTitle" placeholder="Note Title" class="h-12 bg-white/50 border-slate-200 focus:border-amber-500 transition-colors" />
          </div>
          <div class="space-y-2">
            <Label for="content" class="text-sm font-medium">Content (Optional)</Label>
            <Textarea id="content" v-model="newContent" placeholder="Note content..." class="min-h-[100px] bg-white/50 border-slate-200 focus:border-amber-500 transition-colors" />
          </div>
          <Button type="submit" class="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium shadow-lg shadow-amber-500/25 transition-all">
            Save Note
          </Button>
        </form>
      </div>

      <!-- Notes List -->
      <div class="max-w-lg mx-auto space-y-4">
        <p v-if="notes.length === 0" class="text-center text-muted-foreground py-8">
          No notes yet. Create one above!
        </p>
        <Card v-for="note in notes" :key="note.id" class="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-lg font-semibold">{{ note.title }}</CardTitle>
            <div class="flex gap-2">
              <Button variant="outline" size="icon" @click="handleEditClick(note)" class="h-9 w-9 border-slate-200 hover:border-amber-500 hover:text-amber-600">
                <Edit class="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" @click="handleDeleteNote(note.id)" class="h-9 w-9">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-slate-600">{{ note.content }}</p>
            <p class="text-sm text-muted-foreground mt-3">
              Created: {{ new Date(note.created_at).toLocaleDateString() }}
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Edit Dialog -->
      <div v-if="isEditDialogOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/20">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Edit class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-xl font-bold">Edit Note</h2>
          </div>
          <form @submit.prevent="handleEditSubmit" class="space-y-4">
            <div class="space-y-2">
              <Label for="edit-title" class="text-sm font-medium">Title</Label>
              <Input id="edit-title" v-model="editTitle" placeholder="Note Title" class="h-12 bg-white/50 border-slate-200 focus:border-amber-500" />
            </div>
            <div class="space-y-2">
              <Label for="edit-content" class="text-sm font-medium">Content (Optional)</Label>
              <Textarea id="edit-content" v-model="editContent" placeholder="Note content..." class="min-h-[100px] bg-white/50 border-slate-200 focus:border-amber-500" />
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" @click="handleCloseDialog" class="h-11">Cancel</Button>
              <Button type="submit" class="h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">Save Changes</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

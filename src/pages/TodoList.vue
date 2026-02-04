<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import Sidebar from '@/components/Sidebar.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { showSuccess, showError } from '@/utils/toast'
import { Trash2, CheckCircle, Circle, Edit, ListTodo, Plus, Calendar } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { User } from '@supabase/supabase-js'

interface Todo {
  id: string
  user_id: string
  task: string
  is_completed: boolean
  created_at: string
  due_date: string | null
}

const todos = ref<Todo[]>([])
const loading = ref(true)
const user = ref<User | null>(null)
const newTask = ref('')
const newDueDate = ref('')
const editingTodo = ref<Todo | null>(null)
const isEditDialogOpen = ref(false)
const editTask = ref('')
const editDueDate = ref('')

const fetchTodos = async () => {
  if (!user.value) return
  
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching todos:', error)
    showError('Failed to load todos.')
  } else if (data) {
    todos.value = data
  }
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser

  if (currentUser) {
    await fetchTodos()
  }
  loading.value = false
})

const handleCreateTodo = async () => {
  if (!user.value || !newTask.value.trim()) {
    showError('Task cannot be empty.')
    return
  }

  const { data, error } = await supabase
    .from('todos')
    .insert([{
      user_id: user.value.id,
      task: newTask.value,
      due_date: newDueDate.value || null,
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating todo:', error)
    showError('Failed to create todo.')
  } else if (data) {
    showSuccess('Todo created successfully!')
    todos.value = [data, ...todos.value]
    newTask.value = ''
    newDueDate.value = ''
  }
}

const handleDeleteTodo = async (todoId: string) => {
  if (!user.value) return
  
  if (window.confirm('Are you sure you want to delete this todo?')) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId)
      .eq('user_id', user.value.id)

    if (error) {
      console.error('Error deleting todo:', error)
      showError('Failed to delete todo.')
    } else {
      showSuccess('Todo deleted successfully!')
      todos.value = todos.value.filter(todo => todo.id !== todoId)
    }
  }
}

const handleToggleComplete = async (todo: Todo) => {
  if (!user.value) return

  const { data, error } = await supabase
    .from('todos')
    .update({ is_completed: !todo.is_completed })
    .eq('id', todo.id)
    .eq('user_id', user.value.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating todo:', error)
    showError('Failed to update todo.')
  } else if (data) {
    showSuccess(`Todo marked as ${data.is_completed ? 'completed' : 'incomplete'}!`)
    todos.value = todos.value.map(t => t.id === data.id ? data : t)
  }
}

const handleEditClick = (todo: Todo) => {
  editingTodo.value = todo
  editTask.value = todo.task
  editDueDate.value = todo.due_date || ''
  isEditDialogOpen.value = true
}

const handleEditSubmit = async () => {
  if (!user.value || !editingTodo.value) return

  const { data, error } = await supabase
    .from('todos')
    .update({
      task: editTask.value,
      due_date: editDueDate.value || null,
    })
    .eq('id', editingTodo.value.id)
    .eq('user_id', user.value.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating todo:', error)
    showError('Failed to update todo.')
  } else if (data) {
    showSuccess('Todo updated successfully!')
    todos.value = todos.value.map(t => t.id === data.id ? data : t)
    isEditDialogOpen.value = false
    editingTodo.value = null
  }
}

const handleCloseDialog = () => {
  isEditDialogOpen.value = false
  editingTodo.value = null
}

const formatDueDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'PPP')
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-muted-foreground">Loading todos...</p>
    </div>
  </div>
  <div v-else-if="!user" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <p class="text-muted-foreground">Please log in to view your todos.</p>
  </div>
  <div v-else class="flex min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <Sidebar />
    
    <div class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
          <ListTodo class="w-4 h-4" />
          To-Do List
        </div>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-3">
          Your To-Do List
        </h1>
        <p class="text-lg text-muted-foreground">Manage your tasks efficiently</p>
      </div>

      <!-- New Todo Form -->
      <div class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 max-w-lg mx-auto mb-10">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Plus class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-foreground">Add New Task</h2>
            <p class="text-muted-foreground text-sm">Create a new to-do item</p>
          </div>
        </div>
        <form @submit.prevent="handleCreateTodo" class="space-y-4">
          <div class="space-y-2">
            <Label for="task" class="text-sm font-medium">Task</Label>
            <Input id="task" v-model="newTask" placeholder="Enter a new task..." class="h-12 bg-white/50 border-slate-200 focus:border-indigo-500 transition-colors" />
          </div>
          <div class="space-y-2">
            <Label for="due_date" class="text-sm font-medium">Due Date (Optional)</Label>
            <Input id="due_date" v-model="newDueDate" type="date" class="h-12 bg-white/50 border-slate-200 focus:border-indigo-500 transition-colors" />
          </div>
          <Button type="submit" class="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all">
            Add Task
          </Button>
        </form>
      </div>

      <!-- Todo List -->
      <div class="max-w-lg mx-auto space-y-4">
        <p v-if="todos.length === 0" class="text-center text-muted-foreground py-8">
          No tasks yet. Add one above!
        </p>
        <Card v-for="todo in todos" :key="todo.id" class="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent class="flex items-center justify-between p-5">
            <div class="flex items-center gap-4 flex-grow">
              <Button
                variant="ghost"
                size="icon"
                @click="handleToggleComplete(todo)"
                :class="cn(
                  'h-10 w-10 rounded-full transition-all',
                  todo.is_completed ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                )"
              >
                <CheckCircle v-if="todo.is_completed" class="h-5 w-5" />
                <Circle v-else class="h-5 w-5" />
              </Button>
              <div class="flex flex-col">
                <span :class="cn(
                  'font-medium transition-all',
                  todo.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                )">
                  {{ todo.task }}
                </span>
                <span v-if="todo.due_date" class="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar class="w-3 h-3" />
                  Due: {{ formatDueDate(todo.due_date) }}
                </span>
              </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="icon" @click="handleEditClick(todo)" class="h-9 w-9 border-slate-200 hover:border-indigo-500 hover:text-indigo-600">
                <Edit class="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" @click="handleDeleteTodo(todo.id)" class="h-9 w-9">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Edit Dialog -->
      <div v-if="isEditDialogOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/20">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Edit class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-xl font-bold">Edit To-Do</h2>
          </div>
          <form @submit.prevent="handleEditSubmit" class="space-y-4">
            <div class="space-y-2">
              <Label for="edit-task" class="text-sm font-medium">Task</Label>
              <Input id="edit-task" v-model="editTask" placeholder="Edit task..." class="h-12 bg-white/50 border-slate-200 focus:border-indigo-500" />
            </div>
            <div class="space-y-2">
              <Label for="edit-due-date" class="text-sm font-medium">Due Date (Optional)</Label>
              <Input id="edit-due-date" v-model="editDueDate" type="date" class="h-12 bg-white/50 border-slate-200 focus:border-indigo-500" />
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" @click="handleCloseDialog" class="h-11">Cancel</Button>
              <Button type="submit" class="h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">Save Changes</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

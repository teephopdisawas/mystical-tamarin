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
import { Trash2, CheckCircle, Circle, Edit } from 'lucide-vue-next'
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
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    Loading todos...
  </div>
  <div v-else-if="!user" class="flex items-center justify-center min-h-screen">
    Please log in to view your todos.
  </div>
  <div v-else class="flex min-h-screen bg-gray-100">
    <Sidebar />
    
    <div class="flex-1 p-8 overflow-y-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">Your To-Do List</h1>
        <p class="text-xl text-gray-600 mt-4">Manage your tasks.</p>
      </div>

      <!-- New Todo Form -->
      <div class="bg-white p-6 rounded shadow-md max-w-md mx-auto mb-8">
        <h2 class="text-2xl font-bold mb-4 text-center">Add New Task</h2>
        <form @submit.prevent="handleCreateTodo" class="space-y-4">
          <div class="space-y-2">
            <Label for="task">Task</Label>
            <Input id="task" v-model="newTask" placeholder="Enter a new task..." />
          </div>
          <div class="space-y-2">
            <Label for="due_date">Due Date (Optional)</Label>
            <Input id="due_date" v-model="newDueDate" type="date" />
          </div>
          <Button type="submit" class="w-full">Add Task</Button>
        </form>
      </div>

      <!-- Todo List -->
      <div class="max-w-md mx-auto space-y-4">
        <p v-if="todos.length === 0" class="text-center text-gray-600">
          No tasks yet. Add one above!
        </p>
        <Card v-for="todo in todos" :key="todo.id">
          <CardContent class="flex items-center justify-between p-4">
            <div class="flex items-center space-x-3 flex-grow">
              <Button
                variant="ghost"
                size="icon"
                @click="handleToggleComplete(todo)"
              >
                <CheckCircle v-if="todo.is_completed" class="h-5 w-5 text-green-500" />
                <Circle v-else class="h-5 w-5 text-gray-500" />
              </Button>
              <div class="flex flex-col">
                <span :class="cn(todo.is_completed ? 'line-through text-gray-500' : '')">
                  {{ todo.task }}
                </span>
                <span v-if="todo.due_date" class="text-xs text-gray-500 mt-1">
                  Due: {{ formatDueDate(todo.due_date) }}
                </span>
              </div>
            </div>
            <div class="flex space-x-2 flex-shrink-0">
              <Button variant="outline" size="icon" @click="handleEditClick(todo)">
                <Edit class="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" @click="handleDeleteTodo(todo.id)">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Edit Dialog -->
      <div v-if="isEditDialogOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 class="text-xl font-bold mb-4">Edit To-Do</h2>
          <form @submit.prevent="handleEditSubmit" class="space-y-4">
            <div class="space-y-2">
              <Label for="edit-task">Task</Label>
              <Input id="edit-task" v-model="editTask" placeholder="Edit task..." />
            </div>
            <div class="space-y-2">
              <Label for="edit-due-date">Due Date (Optional)</Label>
              <Input id="edit-due-date" v-model="editDueDate" type="date" />
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

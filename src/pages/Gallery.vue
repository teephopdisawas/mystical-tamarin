<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import Sidebar from '@/components/Sidebar.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { showSuccess, showError } from '@/utils/toast'
import { Trash2, Image as ImageIcon, Upload } from 'lucide-vue-next'
import type { User } from '@supabase/supabase-js'

interface ImageObject {
  name: string
  id: string
  created_at: string
  updated_at: string
  last_accessed_at: string
  metadata: Record<string, unknown>
}

const images = ref<ImageObject[]>([])
const loading = ref(true)
const user = ref<User | null>(null)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const fetchImages = async (userId: string) => {
  loading.value = true
  const { data, error } = await supabase.storage
    .from('images')
    .list(`${userId}/`, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error) {
    console.error('Error fetching images:', error)
    showError('Failed to load images.')
    images.value = []
  } else if (data) {
    const imageFiles = data.filter(item => item.id !== null)
    images.value = imageFiles
  }
  loading.value = false
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser

  if (currentUser) {
    await fetchImages(currentUser.id)
  } else {
    loading.value = false
  }
})

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!user.value || !target.files || target.files.length === 0) {
    showError('Please select a file to upload.')
    return
  }

  const file = target.files[0]
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${user.value.id}/${fileName}`

  uploading.value = true

  const { error } = await supabase.storage
    .from('images')
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading image:', error)
    showError('Failed to upload image.')
  } else {
    showSuccess('Image uploaded successfully!')
    fetchImages(user.value.id)
  }

  uploading.value = false
  target.value = ''
}

const handleDeleteImage = async (imageName: string) => {
  if (!user.value) {
    showError('You must be logged in to delete images.')
    return
  }

  if (window.confirm('Are you sure you want to delete this image?')) {
    const filePath = `${user.value.id}/${imageName}`

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])

    if (error) {
      console.error('Error deleting image:', error)
      showError('Failed to delete image.')
    } else {
      showSuccess('Image deleted successfully!')
      images.value = images.value.filter(image => image.name !== imageName)
    }
  }
}

const getImageUrl = (imageName: string): string => {
  if (!user.value) return ''
  const filePath = `${user.value.id}/${imageName}`
  const { data } = supabase.storage.from('images').getPublicUrl(filePath)
  return data.publicUrl
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-muted-foreground">Loading gallery...</p>
    </div>
  </div>
  <div v-else-if="!user" class="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <p class="text-muted-foreground">Please log in to view the gallery.</p>
  </div>
  <div v-else class="flex min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <Sidebar />
    
    <div class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium mb-4">
          <ImageIcon class="w-4 h-4" />
          Gallery
        </div>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-3">
          Your Image Gallery
        </h1>
        <p class="text-lg text-muted-foreground">Upload and view your images</p>
      </div>

      <!-- Image Upload Section -->
      <div class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 max-w-lg mx-auto mb-10">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25">
            <Upload class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-foreground">Upload Image</h2>
            <p class="text-muted-foreground text-sm">Add new images to your gallery</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <Input
            ref="fileInput"
            type="file"
            accept="image/*"
            :disabled="uploading"
            @change="handleFileUpload"
            class="flex-1 h-12 bg-white/50 border-slate-200 focus:border-pink-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-100 file:text-pink-700 file:font-medium hover:file:bg-pink-200"
          />
          <p v-if="uploading" class="text-pink-600 font-medium animate-pulse">Uploading...</p>
        </div>
      </div>

      <!-- Image Gallery Display -->
      <div class="max-w-5xl mx-auto">
        <p v-if="images.length === 0" class="text-center text-muted-foreground py-12">
          No images yet. Upload one above!
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card v-for="image in images" :key="image.id" class="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <CardContent class="p-0">
              <div class="relative overflow-hidden">
                <img
                  :src="getImageUrl(image.name)"
                  :alt="image.name"
                  class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div class="p-4 flex justify-between items-center">
                <p class="text-sm text-slate-700 truncate font-medium">{{ image.name }}</p>
                <Button
                  variant="destructive"
                  size="icon"
                  class="flex-shrink-0 h-9 w-9"
                  @click="handleDeleteImage(image.name)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

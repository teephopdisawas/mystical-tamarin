<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import Sidebar from '@/components/Sidebar.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { showSuccess, showError } from '@/utils/toast'
import { Trash2 } from 'lucide-vue-next'
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
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    Loading gallery...
  </div>
  <div v-else-if="!user" class="flex items-center justify-center min-h-screen">
    Please log in to view the gallery.
  </div>
  <div v-else class="flex min-h-screen bg-gray-100">
    <Sidebar />
    
    <div class="flex-1 p-8 overflow-y-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">Your Image Gallery</h1>
        <p class="text-xl text-gray-600 mt-4">Upload and view your images.</p>
      </div>

      <!-- Image Upload Section -->
      <div class="bg-white p-6 rounded shadow-md max-w-md mx-auto mb-8">
        <h2 class="text-2xl font-bold mb-4 text-center">Upload Image</h2>
        <div class="flex items-center space-x-2">
          <Input
            ref="fileInput"
            type="file"
            accept="image/*"
            :disabled="uploading"
            @change="handleFileUpload"
          />
          <p v-if="uploading">Uploading...</p>
        </div>
      </div>

      <!-- Image Gallery Display -->
      <div class="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <p v-if="images.length === 0" class="col-span-full text-center text-gray-600">
          No images yet. Upload one above!
        </p>
        <Card v-for="image in images" :key="image.id">
          <CardContent class="p-2">
            <img
              :src="getImageUrl(image.name)"
              :alt="image.name"
              class="w-full h-48 object-cover rounded-md mb-2"
            />
            <div class="flex justify-between items-center">
              <p class="text-sm text-gray-700 truncate">{{ image.name }}</p>
              <Button
                variant="destructive"
                size="icon"
                class="flex-shrink-0"
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
</template>

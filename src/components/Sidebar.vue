<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import { cn } from '@/lib/utils'
import { computed } from 'vue'

interface Props {
  showLogout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLogout: false
})

const emit = defineEmits<{
  logout: []
}>()

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/notes', label: 'Notes' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/messaging', label: 'Messaging' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/todo', label: 'To-Do List' },
]

const handleLogout = () => {
  emit('logout')
}
</script>

<template>
  <div class="w-64 bg-white shadow-md p-4 flex flex-col">
    <h3 class="text-lg font-semibold mb-4">Mini Apps</h3>
    <ul class="flex-grow space-y-2">
      <li v-for="item in navItems" :key="item.to">
        <RouterLink
          :to="item.to"
          class="inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
        >
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
    <div v-if="showLogout" class="mt-auto">
      <Button class="w-full" @click="handleLogout">Logout</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  StickyNote, 
  Image, 
  MessageCircle, 
  Calculator, 
  CheckSquare,
  LogOut
} from 'lucide-vue-next'
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

const route = useRoute()

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/gallery', label: 'Gallery', icon: Image },
  { to: '/messaging', label: 'Messaging', icon: MessageCircle },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/todo', label: 'To-Do List', icon: CheckSquare },
]

const handleLogout = () => {
  emit('logout')
}

const isActiveRoute = (path: string) => {
  return route.path === path
}
</script>

<template>
  <div class="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 p-6 flex flex-col shadow-xl">
    <!-- Logo -->
    <div class="flex items-center gap-3 mb-8 px-2">
      <div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Portal</h3>
        <p class="text-xs text-muted-foreground">Mini Apps Suite</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-grow space-y-2">
      <RouterLink
        v-for="item in navItems" 
        :key="item.to"
        :to="item.to"
        :class="cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
          isActiveRoute(item.to) 
            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' 
            : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
        )"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Logout Button -->
    <div v-if="showLogout" class="mt-auto pt-6 border-t border-slate-200/50">
      <Button 
        class="w-full justify-start gap-3 h-12 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors" 
        variant="ghost"
        @click="handleLogout"
      >
        <LogOut class="w-5 h-5" />
        Logout
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { cn } from '@/lib/utils'
import { evaluate, format } from 'mathjs'

type NumberBase = 'DEC' | 'BIN' | 'HEX' | 'OCT'

const input = ref('')
const result = ref('')
const currentBase = ref<NumberBase>('DEC')

const convertToBase = (numStr: string, base: NumberBase): string => {
  try {
    if (numStr === '' || numStr === 'Error') return numStr

    const num = parseFloat(numStr)
    if (isNaN(num)) return 'Invalid Number'

    if (base !== 'DEC' && !Number.isInteger(num)) {
      return 'Integer only'
    }

    switch (base) {
      case 'DEC':
        return num.toString()
      case 'BIN':
        return num.toString(2)
      case 'HEX':
        return num.toString(16).toUpperCase()
      case 'OCT':
        return num.toString(8)
      default:
        return numStr
    }
  } catch (e) {
    console.error('Conversion error:', e)
    return 'Error'
  }
}

watch([input, currentBase], ([inp, base]) => {
  if (inp === '') {
    result.value = ''
    return
  }
  try {
    const calculatedResult = evaluate(inp)
    const formattedResult = format(calculatedResult, { precision: 14 })
    result.value = convertToBase(formattedResult, base)
  } catch {
    result.value = 'Error'
  }
})

const handleButtonClick = (value: string) => {
  if (['DEC', 'BIN', 'HEX', 'OCT'].includes(value)) {
    currentBase.value = value as NumberBase
  } else if (value === '=') {
    try {
      const calculatedResult = evaluate(input.value)
      const formattedResult = format(calculatedResult, { precision: 14 })
      result.value = convertToBase(formattedResult, currentBase.value)
      input.value = formattedResult
    } catch {
      result.value = 'Error'
      input.value = ''
    }
  } else if (value === 'C') {
    input.value = ''
    result.value = ''
  } else if (value === 'DEL') {
    input.value = input.value.slice(0, -1)
  } else {
    input.value += value
  }
}

const standardButtons = [
  'C', 'DEL', '/', '*',
  '7', '8', '9', '-',
  '4', '5', '6', '+',
  '1', '2', '3', '=',
  '0', '.',
]

const baseButtons: NumberBase[] = ['DEC', 'BIN', 'HEX', 'OCT']

const scientificButtons = [
  'sqrt(', 'sin(', 'cos(', 'tan(',
]
</script>

<template>
  <div class="flex min-h-screen bg-gray-100">
    <Sidebar />
    
    <div class="flex-1 p-8 overflow-y-auto flex justify-center items-start">
      <Card class="w-full max-w-sm">
        <CardHeader>
          <CardTitle class="text-center">Calculator</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Base Selection Buttons -->
          <div class="grid grid-cols-4 gap-2">
            <Button
              v-for="base in baseButtons"
              :key="base"
              :variant="currentBase === base ? 'default' : 'outline'"
              class="text-sm p-2 h-auto"
              @click="handleButtonClick(base)"
            >
              {{ base }}
            </Button>
          </div>

          <!-- Display -->
          <div class="text-right text-2xl p-4 h-auto bg-gray-100 rounded-md break-words">
            <div class="text-sm text-gray-600">{{ input }}</div>
            <div>{{ result }}</div>
          </div>

          <!-- Scientific Buttons -->
          <div class="grid grid-cols-4 gap-2">
            <Button
              v-for="btn in scientificButtons"
              :key="btn"
              class="text-lg p-4 h-auto bg-gray-200 hover:bg-gray-300 text-gray-800"
              @click="handleButtonClick(btn)"
            >
              {{ btn }}
            </Button>
          </div>

          <!-- Calculator Buttons -->
          <div class="grid grid-cols-4 gap-2">
            <Button
              v-for="btn in standardButtons"
              :key="btn"
              :class="cn(
                'text-lg p-4 h-auto',
                btn === '=' ? 'col-span-2 bg-blue-500 hover:bg-blue-600 text-white' : '',
                btn === 'C' || btn === 'DEL' ? 'bg-red-500 hover:bg-red-600 text-white' : '',
                ['/', '*', '-', '+'].includes(btn) ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : ''
              )"
              @click="handleButtonClick(btn)"
            >
              {{ btn }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

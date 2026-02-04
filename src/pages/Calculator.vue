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
import { Calculator as CalculatorIcon } from 'lucide-vue-next'

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
  <div class="flex min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
    <Sidebar />
    
    <div class="flex-1 p-8 overflow-y-auto flex justify-center items-start">
      <div class="w-full max-w-sm">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            <CalculatorIcon class="w-4 h-4" />
            Calculator
          </div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
            Calculator
          </h1>
        </div>

        <Card class="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
          <CardHeader class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white pb-4">
            <CardTitle class="text-center text-lg font-medium">Scientific Calculator</CardTitle>
          </CardHeader>
          <CardContent class="p-6 space-y-5">
            <!-- Base Selection Buttons -->
            <div class="grid grid-cols-4 gap-2">
              <Button
                v-for="base in baseButtons"
                :key="base"
                :variant="currentBase === base ? 'default' : 'outline'"
                :class="cn(
                  'text-sm p-2 h-10 font-medium transition-all',
                  currentBase === base 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-0 text-white shadow-md' 
                    : 'bg-white/50 border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                )"
                @click="handleButtonClick(base)"
              >
                {{ base }}
              </Button>
            </div>

            <!-- Display -->
            <div class="text-right p-5 bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
              <div class="text-sm text-slate-400 mb-1 h-5 overflow-hidden">{{ input }}</div>
              <div class="text-3xl font-mono text-emerald-400 font-bold">{{ result || '0' }}</div>
            </div>

            <!-- Scientific Buttons -->
            <div class="grid grid-cols-4 gap-2">
              <Button
                v-for="btn in scientificButtons"
                :key="btn"
                class="text-sm p-3 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border-0"
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
                  'text-lg p-4 h-14 font-semibold transition-all border-0',
                  btn === '=' ? 'col-span-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25' : '',
                  btn === 'C' || btn === 'DEL' ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-md' : '',
                  ['/', '*', '-', '+'].includes(btn) ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : '',
                  !['=', 'C', 'DEL', '/', '*', '-', '+'].includes(btn) ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm' : ''
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
  </div>
</template>

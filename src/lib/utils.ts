import type { Ref } from 'vue'
import { type ClassValue, clsx } from 'clsx'
import type { Updater } from '@tanstack/vue-table'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === 'function'
    ? updaterOrValue(ref.value)
    : updaterOrValue
}

const unit = ['', 'K', 'M', 'B', 'T']
export function formattedCount(count: number, digits = 0): string {
  if (count < 1000) {
    return count.toString()
  }
  let offset = 0
  while (count >= 1000) {
    count = (count / 1000)
    offset++
  }
  return count.toFixed(digits) + unit[offset]
}
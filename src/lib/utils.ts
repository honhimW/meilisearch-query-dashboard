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

export async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export function versionAfter(current: string, expected: string): boolean {
  const current_versions = current.split('.')
  const expected_versions = expected.split('.')
  const len = Math.min(current_versions.length, expected_versions.length)

  for (let i = 0; i < len; i++) {
    const cv = current_versions[i]
    const ev = expected_versions[i]

    if (cv > ev || cv.length > ev.length) {
      return true
    } else if (cv < ev || cv.length < ev.length) {
      return false
    }
  }

  return true
}
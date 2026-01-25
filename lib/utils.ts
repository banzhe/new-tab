import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fillDefaults<T extends object>(result: T, defaultValue: T) {
  return Object.assign(deepClone(defaultValue), result)
}

export function deepClone<T extends object>(data: T) {
  return JSON.parse(JSON.stringify(data))
}

export function formatCountdownTime(ms: number): string {
  if (ms <= 0) return "即将重置"
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天${hours % 24}小时后重置`
  }
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟后重置`
  }
  if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒后重置`
  }
  return `${seconds}秒后重置`
}

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

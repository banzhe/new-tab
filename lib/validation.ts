import type { AppConfig, Bookmark } from "@/types/messages"

export interface ValidationResult {
  valid: boolean
  error?: string
  sanitized?: AppConfig
}

function isValidBookmark(data: unknown): data is Bookmark {
  if (!data || typeof data !== "object") return false
  const b = data as Record<string, unknown>
  return (
    typeof b.id === "string" &&
    typeof b.title === "string" &&
    typeof b.url === "string" &&
    (b.favicon === undefined || typeof b.favicon === "string")
  )
}

function sanitizeBookmark(bookmark: unknown): Bookmark {
  const b = bookmark as Record<string, unknown>

  let favicon: string | undefined
  if (b.favicon && typeof b.favicon === "string") {
    if (b.favicon.startsWith("data:image/")) {
      favicon = b.favicon
    }
  }

  return {
    id: String(b.id || crypto.randomUUID()),
    title: String(b.title || ""),
    url: String(b.url || ""),
    ...(favicon && { favicon }),
  }
}

export function validateConfig(data: unknown): ValidationResult {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "配置数据格式错误" }
  }

  const config = data as Record<string, unknown>

  const requiredFields = ["yesCode", "cursorSettings", "bookmarks"]
  for (const field of requiredFields) {
    if (!(field in config)) {
      return { valid: false, error: `缺少必需字段: ${field}` }
    }
  }

  const yesCode = config.yesCode as Record<string, unknown>
  if (!yesCode || typeof yesCode !== "object") {
    return { valid: false, error: "yesCode 格式错误" }
  }
  if (typeof yesCode.showUsage !== "boolean") {
    return { valid: false, error: "yesCode.showUsage 必须是布尔值" }
  }

  const cursorSettings = config.cursorSettings as Record<string, unknown>
  if (!cursorSettings || typeof cursorSettings !== "object") {
    return { valid: false, error: "cursorSettings 格式错误" }
  }
  if (typeof cursorSettings.showUsage !== "boolean") {
    return { valid: false, error: "cursorSettings.showUsage 必须是布尔值" }
  }

  const bookmarks = config.bookmarks as Record<string, unknown>
  if (!bookmarks || typeof bookmarks !== "object") {
    return { valid: false, error: "bookmarks 格式错误" }
  }
  if (!Array.isArray(bookmarks.items)) {
    return { valid: false, error: "bookmarks.items 必须是数组" }
  }

  for (let i = 0; i < bookmarks.items.length; i++) {
    const bookmark = bookmarks.items[i]
    if (!isValidBookmark(bookmark)) {
      return { valid: false, error: `书签 ${i + 1} 格式错误` }
    }
  }

  const sanitized: AppConfig = {
    yesCode: { showUsage: Boolean(yesCode.showUsage) },
    cursorSettings: { showUsage: Boolean(cursorSettings.showUsage) },
    bookmarks: { items: bookmarks.items.map(sanitizeBookmark) },
    sendCookie: [],
    miniMax: { apiKey: "", showUsage: false },
  }

  return { valid: true, sanitized }
}

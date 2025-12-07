import type { Bookmark, YesCodeConfig } from "@/types/messages"

export interface ValidationResult {
  valid: boolean
  error?: string
  sanitized?: YesCodeConfig
}

/**
 * 验证书签对象格式是否正确
 */
function isValidBookmark(data: unknown): data is Bookmark {
  if (!data || typeof data !== "object") return false
  const b = data as Record<string, unknown>
  return (
    typeof b.id === "string" &&
    typeof b.title === "string" &&
    typeof b.url === "string"
  )
}

/**
 * 清洗书签数据，确保数据完整性
 */
function sanitizeBookmark(bookmark: unknown): Bookmark {
  const b = bookmark as Record<string, unknown>
  return {
    id: String(b.id || crypto.randomUUID()),
    title: String(b.title || ""),
    url: String(b.url || ""),
  }
}

/**
 * 验证配置对象是否符合 YesCodeConfig 格式
 * @param data - 待验证的数据
 * @returns 验证结果，包含是否有效、错误信息和清洗后的数据
 */
export function validateConfig(data: unknown): ValidationResult {
  // 1. 类型检查
  if (!data || typeof data !== "object") {
    return { valid: false, error: "配置数据格式错误" }
  }

  const config = data as Record<string, unknown>

  // 2. 必需字段检查
  const requiredFields = [
    "apiKey",
    "showBalance",
    "showCursorUsage",
    "bookmarks",
  ]
  for (const field of requiredFields) {
    if (!(field in config)) {
      return { valid: false, error: `缺少必需字段: ${field}` }
    }
  }

  // 3. 字段类型验证
  if (typeof config.apiKey !== "string") {
    return { valid: false, error: "apiKey 必须是字符串" }
  }

  if (typeof config.showBalance !== "boolean") {
    return { valid: false, error: "showBalance 必须是布尔值" }
  }

  if (typeof config.showCursorUsage !== "boolean") {
    return { valid: false, error: "showCursorUsage 必须是布尔值" }
  }

  if (!Array.isArray(config.bookmarks)) {
    return { valid: false, error: "bookmarks 必须是数组" }
  }

  // 4. 书签格式验证
  for (let i = 0; i < config.bookmarks.length; i++) {
    const bookmark = config.bookmarks[i]
    if (!isValidBookmark(bookmark)) {
      return { valid: false, error: `书签 ${i + 1} 格式错误` }
    }
  }

  // 5. 数据清洗 - 移除未知字段，确保类型正确
  const sanitized: YesCodeConfig = {
    apiKey: String(config.apiKey),
    showBalance: Boolean(config.showBalance),
    showCursorUsage: Boolean(config.showCursorUsage),
    bookmarks: config.bookmarks.map(sanitizeBookmark),
  }

  return { valid: true, sanitized }
}

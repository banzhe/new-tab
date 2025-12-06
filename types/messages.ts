// ========== 书签类型 ==========
export interface Bookmark {
  id: string
  title: string
  url: string
}

// ========== 存储配置类型 ==========
export interface YesCodeConfig {
  apiKey: string
  showBalance: boolean
  showCursorUsage: boolean
  bookmarks: Bookmark[]
}

// ========== 余额数据类型 ==========
export interface YesCodeBalanceData {
  balance: number
  pay_as_you_go_balance: number
  subscription_balance: number
  total_balance: number
  weekly_limit: number
  weekly_spent_balance: number
}

// ========== Cursor 用量数据类型 ==========
export interface CursorUsageAggregation {
  modelIntent: string
  inputTokens?: string
  outputTokens?: string
  cacheWriteTokens?: string
  cacheReadTokens?: string
  totalCents?: number
}

export interface CursorUsageData {
  aggregations: CursorUsageAggregation[]
  totalInputTokens: string
  totalOutputTokens: string
  totalCacheWriteTokens: string
  totalCacheReadTokens: string
  totalCostCents: number
}

// ========== 消息类型枚举 ==========
export enum MessageType {
  // 配置相关
  GET_CONFIG = "GET_CONFIG",
  SAVE_CONFIG = "SAVE_CONFIG",
  CONFIG_UPDATED = "CONFIG_UPDATED",

  // 余额相关
  FETCH_BALANCE = "FETCH_BALANCE",

  // Cursor 用量相关
  FETCH_CURSOR_USAGE = "FETCH_CURSOR_USAGE",
}

// ========== 消息结构定义 ==========
export interface BaseMessage {
  type: MessageType
}

// 请求消息
export interface GetConfigMessage extends BaseMessage {
  type: MessageType.GET_CONFIG
}

export interface SaveConfigMessage extends BaseMessage {
  type: MessageType.SAVE_CONFIG
  payload: YesCodeConfig
}

export interface FetchBalanceMessage extends BaseMessage {
  type: MessageType.FETCH_BALANCE
}

export interface FetchCursorUsageMessage extends BaseMessage {
  type: MessageType.FETCH_CURSOR_USAGE
}

export interface ConfigUpdatedMessage extends BaseMessage {
  type: MessageType.CONFIG_UPDATED
}

// 响应消息
export interface MessageResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export type ConfigResponse = MessageResponse<YesCodeConfig>
export type BalanceResponse = MessageResponse<YesCodeBalanceData>
export type CursorUsageResponse = MessageResponse<CursorUsageData>

// 联合类型
export type ExtensionMessage =
  | GetConfigMessage
  | SaveConfigMessage
  | FetchBalanceMessage
  | FetchCursorUsageMessage
  | ConfigUpdatedMessage

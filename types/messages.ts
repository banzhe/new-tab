// ========== 书签类型 ==========
export interface Bookmark {
  id: string
  title: string
  url: string
  favicon?: string // Base64 data URL
}

// ========== 存储配置类型 ==========
export interface YesCodeConfig {
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

// ========== SendCookie 配置类型 ==========
export interface SendCookieConfigItem {
  id: string // 唯一标识符
  domain: string // 网站域名（如 "example.com"）
  apiUrl: string // 后端 API 地址（完整 URL）
  interval: number // 发送间隔（毫秒）
  enabled: boolean // 是否启用
}

export type SendCookieConfig = SendCookieConfigItem[]

// ========== MiniMax 配置类型 ==========
export interface MiniMaxConfig {
  apiKey: string
  showUsage: boolean
}

// ========== MiniMax 周期用量数据类型 ==========
export interface ModelRemain {
  start_time: number
  end_time: number
  remains_time: number
  current_interval_total_count: number
  current_interval_usage_count: number
  model_name: string
}

export interface MiniMaxRemainsData {
  model_remains: ModelRemain[]
}

// ========== 消息类型枚举 ==========
export enum MessageType {
  // 配置相关
  GET_CONFIG = "GET_CONFIG",
  SAVE_CONFIG = "SAVE_CONFIG",
  CONFIG_UPDATED = "CONFIG_UPDATED",

  // SendCookie 配置相关
  GET_SEND_COOKIE_CONFIG = "GET_SEND_COOKIE_CONFIG",
  SAVE_SEND_COOKIE_CONFIG = "SAVE_SEND_COOKIE_CONFIG",
  SEND_COOKIE_CONFIG_UPDATED = "SEND_COOKIE_CONFIG_UPDATED",

  // 余额相关
  FETCH_BALANCE = "FETCH_BALANCE",

  // Cursor 用量相关
  FETCH_CURSOR_USAGE = "FETCH_CURSOR_USAGE",

  // MiniMax 用量相关
  GET_MINIMAX_CONFIG = "GET_MINIMAX_CONFIG",
  SAVE_MINIMAX_CONFIG = "SAVE_MINIMAX_CONFIG",
  FETCH_MINIMAX_REMAINS = "FETCH_MINIMAX_REMAINS",
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

export interface GetSendCookieConfigMessage extends BaseMessage {
  type: MessageType.GET_SEND_COOKIE_CONFIG
}

export interface SaveSendCookieConfigMessage extends BaseMessage {
  type: MessageType.SAVE_SEND_COOKIE_CONFIG
  payload: SendCookieConfig
}

export interface SendCookieConfigUpdatedMessage extends BaseMessage {
  type: MessageType.SEND_COOKIE_CONFIG_UPDATED
}

// MiniMax 相关消息
export interface GetMiniMaxConfigMessage extends BaseMessage {
  type: MessageType.GET_MINIMAX_CONFIG
}

export interface SaveMiniMaxConfigMessage extends BaseMessage {
  type: MessageType.SAVE_MINIMAX_CONFIG
  payload: MiniMaxConfig
}

export interface FetchMiniMaxRemainsMessage extends BaseMessage {
  type: MessageType.FETCH_MINIMAX_REMAINS
}

// 响应消息
export interface MessageResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export type ConfigResponse = MessageResponse<YesCodeConfig>
export type SendCookieConfigResponse = MessageResponse<SendCookieConfig>
export type BalanceResponse = MessageResponse<YesCodeBalanceData>
export type CursorUsageResponse = MessageResponse<CursorUsageData>
export type MiniMaxConfigResponse = MessageResponse<MiniMaxConfig>
export type MiniMaxRemainsResponse = MessageResponse<MiniMaxRemainsData>

// 联合类型
export type ExtensionMessage =
  | GetConfigMessage
  | SaveConfigMessage
  | GetSendCookieConfigMessage
  | SaveSendCookieConfigMessage
  | FetchBalanceMessage
  | FetchCursorUsageMessage
  | ConfigUpdatedMessage
  | SendCookieConfigUpdatedMessage
  | GetMiniMaxConfigMessage
  | SaveMiniMaxConfigMessage
  | FetchMiniMaxRemainsMessage

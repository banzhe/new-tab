export interface Bookmark {
  id: string
  title: string
  url: string
  favicon?: string
}

export interface CursorSettingsConfig {
  showUsage: boolean
}

export interface YesCodeConfig {
  showUsage: boolean
}

export interface BookmarkConfig {
  items: Bookmark[]
}

export interface SendCookieConfigItem {
  id: string
  domain: string
  apiUrl: string
  interval: number
  enabled: boolean
}

export type SendCookieConfig = SendCookieConfigItem[]

export interface MiniMaxConfig {
  apiKey: string
  showUsage: boolean
}

export interface PackyCodexConfig {
  showUsage: boolean
}

export interface AppConfig {
  yesCode: YesCodeConfig
  cursorSettings: CursorSettingsConfig
  packyCodex: PackyCodexConfig
  bookmarks: BookmarkConfig
  sendCookie: SendCookieConfig
  miniMax: MiniMaxConfig
}

export interface YesCodeBalanceData {
  balance: number
  pay_as_you_go_balance: number
  subscription_balance: number
  total_balance: number
  weekly_limit: number
  weekly_spent_balance: number
}

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

export interface PackyCodexUserInfo {
  daily_budget_usd: string
  daily_spent_usd: string
  weekly_budget_usd: string
  weekly_spent_usd: string
  weekly_window_end: string
  weekly_window_start?: string
}

export enum MessageType {
  GET_APP_CONFIG = "GET_APP_CONFIG",
  SAVE_APP_CONFIG = "SAVE_APP_CONFIG",
  APP_CONFIG_UPDATED = "APP_CONFIG_UPDATED",
  FETCH_BALANCE = "FETCH_BALANCE",
  FETCH_CURSOR_USAGE = "FETCH_CURSOR_USAGE",
  FETCH_MINIMAX_REMAINS = "FETCH_MINIMAX_REMAINS",
  FETCH_PACKYCODEX_USER_INFO = "FETCH_PACKYCODEX_USER_INFO",
}

export interface BaseMessage {
  type: MessageType
}

export interface GetAppConfigMessage extends BaseMessage {
  type: MessageType.GET_APP_CONFIG
}

export interface SaveAppConfigMessage extends BaseMessage {
  type: MessageType.SAVE_APP_CONFIG
  payload: Partial<AppConfig>
}

export interface AppConfigUpdatedMessage extends BaseMessage {
  type: MessageType.APP_CONFIG_UPDATED
}

export interface FetchBalanceMessage extends BaseMessage {
  type: MessageType.FETCH_BALANCE
}

export interface FetchCursorUsageMessage extends BaseMessage {
  type: MessageType.FETCH_CURSOR_USAGE
}

export interface FetchMiniMaxRemainsMessage extends BaseMessage {
  type: MessageType.FETCH_MINIMAX_REMAINS
}

export interface FetchPackyCodexUserInfoMessage extends BaseMessage {
  type: MessageType.FETCH_PACKYCODEX_USER_INFO
}

export interface MessageResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export type AppConfigResponse = MessageResponse<AppConfig>
export type BalanceResponse = MessageResponse<YesCodeBalanceData>
export type CursorUsageResponse = MessageResponse<CursorUsageData>
export type MiniMaxRemainsResponse = MessageResponse<MiniMaxRemainsData>
export type PackyCodexUserInfoResponse = MessageResponse<PackyCodexUserInfo>

export type ExtensionMessage =
  | GetAppConfigMessage
  | SaveAppConfigMessage
  | AppConfigUpdatedMessage
  | FetchBalanceMessage
  | FetchCursorUsageMessage
  | FetchMiniMaxRemainsMessage
  | FetchPackyCodexUserInfoMessage

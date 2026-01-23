import { ProtocolWithReturn } from "webext-bridge"
import type {
  YesCodeConfig,
  SendCookieConfig,
  YesCodeBalanceData,
  CursorUsageData,
  MiniMaxConfig,
  MiniMaxRemainsData,
  MessageResponse,
} from "./messages"

declare module "webext-bridge" {
  export interface ProtocolMap {
    // 配置相关
    getConfig: ProtocolWithReturn<null, MessageResponse<YesCodeConfig>>
    saveConfig: ProtocolWithReturn<YesCodeConfig, MessageResponse>
    configUpdated: null

    // SendCookie 配置相关
    getSendCookieConfig: ProtocolWithReturn<null, MessageResponse<SendCookieConfig>>
    saveSendCookieConfig: ProtocolWithReturn<SendCookieConfig, MessageResponse>
    sendCookieConfigUpdated: null

    // 余额相关
    fetchBalance: ProtocolWithReturn<null, MessageResponse<YesCodeBalanceData>>

    // Cursor 用量相关
    fetchCursorUsage: ProtocolWithReturn<null, MessageResponse<CursorUsageData>>

    // MiniMax 相关
    getMiniMaxConfig: ProtocolWithReturn<null, MessageResponse<MiniMaxConfig>>
    saveMiniMaxConfig: ProtocolWithReturn<MiniMaxConfig, MessageResponse>
    fetchMiniMaxRemains: ProtocolWithReturn<null, MessageResponse<MiniMaxRemainsData>>
  }
}

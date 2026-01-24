import { ProtocolWithReturn } from "webext-bridge"
import type {
  AppConfig,
  YesCodeBalanceData,
  CursorUsageData,
  MiniMaxRemainsData,
  MessageResponse,
} from "./messages"

declare module "webext-bridge" {
  export interface ProtocolMap {
    getAppConfig: ProtocolWithReturn<null, MessageResponse<AppConfig>>
    saveAppConfig: ProtocolWithReturn<Partial<AppConfig>, MessageResponse>
    appConfigUpdated: null

    fetchBalance: ProtocolWithReturn<null, MessageResponse<YesCodeBalanceData>>

    fetchCursorUsage: ProtocolWithReturn<null, MessageResponse<CursorUsageData>>

    fetchMiniMaxRemains: ProtocolWithReturn<
      null,
      MessageResponse<MiniMaxRemainsData>
    >
  }
}

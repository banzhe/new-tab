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
    GET_APP_CONFIG: ProtocolWithReturn<null, MessageResponse<AppConfig>>
    SAVE_APP_CONFIG: ProtocolWithReturn<Partial<AppConfig>, MessageResponse>
    APP_CONFIG_UPDATED: null

    FETCH_BALANCE: ProtocolWithReturn<null, MessageResponse<YesCodeBalanceData>>

    FETCH_CURSOR_USAGE: ProtocolWithReturn<
      null,
      MessageResponse<CursorUsageData>
    >

    FETCH_MINIMAX_REMAINS: ProtocolWithReturn<
      null,
      MessageResponse<MiniMaxRemainsData>
    >
  }
}

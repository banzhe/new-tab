import { useRequest } from "ahooks"
import { Settings } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import {
  type Bookmark,
  type ConfigResponse,
  MessageType,
  type SaveConfigMessage,
  type SendCookieConfig,
  type SendCookieConfigResponse,
  type SaveSendCookieConfigMessage,
} from "@/types/messages"
import { BookmarkSettings } from "./BookmarkSettings"
import { ConfigImportExport } from "./ConfigImportExport"
import { CursorSettings } from "./CursorSettings"
import { SendCookieSettings } from "./SendCookieSettings"
import { YesCodeSettings } from "./YesCodeSettings"

export function SettingsDrawer() {
  const [open, setOpen] = useState(false)
  const [yesCodeApiKey, setYesCodeApiKey] = useState("")
  const [showBalance, setShowBalance] = useState(true)
  const [showCursorUsage, setShowCursorUsage] = useState(true)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [sendCookieConfigs, setSendCookieConfigs] = useState<SendCookieConfig>(
    [],
  )

  // Load config using useRequest
  const { refresh: reloadConfig } = useRequest(
    async () => {
      const [configResponse, sendCookieResponse] = await Promise.all([
        browser.runtime.sendMessage<ConfigResponse>({
          type: MessageType.GET_CONFIG,
        }),
        browser.runtime.sendMessage<SendCookieConfigResponse>({
          type: MessageType.GET_SEND_COOKIE_CONFIG,
        }),
      ])

      if (configResponse.success && configResponse.data) {
        setYesCodeApiKey(configResponse.data.apiKey)
        setShowBalance(configResponse.data.showBalance)
        setShowCursorUsage(configResponse.data.showCursorUsage)
        setBookmarks(configResponse.data.bookmarks || [])
      }

      if (sendCookieResponse.success && sendCookieResponse.data) {
        setSendCookieConfigs(sendCookieResponse.data)
      }

      return { configResponse, sendCookieResponse }
    },
    {
      onError: (error) => {
        console.error("Failed to load config:", error)
      },
    },
  )

  // Save config using useRequest
  const { loading: saving, run: saveConfig } = useRequest(
    async () => {
      const [configResponse, sendCookieResponse] = await Promise.all([
        browser.runtime.sendMessage<SaveConfigMessage>({
          type: MessageType.SAVE_CONFIG,
          payload: {
            apiKey: yesCodeApiKey,
            showBalance,
            showCursorUsage,
            bookmarks,
          },
        }),
        browser.runtime.sendMessage<SaveSendCookieConfigMessage>({
          type: MessageType.SAVE_SEND_COOKIE_CONFIG,
          payload: sendCookieConfigs,
        }),
      ])

      if (!configResponse.success) {
        throw new Error(configResponse.error || "Failed to save config")
      }

      if (!sendCookieResponse.success) {
        throw new Error(
          sendCookieResponse.error || "Failed to save sendCookie config",
        )
      }

      if (configResponse.success && sendCookieResponse.success) {
        setOpen(false)
        // Background script will automatically broadcast update notification
      }

      return { configResponse, sendCookieResponse }
    },
    {
      manual: true,
      onError: (error) => {
        console.error("Failed to save config:", error)
      },
    },
  )

  const handleCancel = () => {
    // Reload settings from background script
    reloadConfig()
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      {/* Trigger button - fixed top-right */}
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50"
          aria-label="设置"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        {/* Header with close button */}
        <DrawerHeader>
          <DrawerTitle>设置</DrawerTitle>
        </DrawerHeader>

        {/* Scrollable content area */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <YesCodeSettings
            apiKey={yesCodeApiKey}
            onApiKeyChange={setYesCodeApiKey}
            showBalance={showBalance}
            onShowBalanceChange={setShowBalance}
          />

          <CursorSettings
            showCursorUsage={showCursorUsage}
            onShowCursorUsageChange={setShowCursorUsage}
          />

          <BookmarkSettings
            bookmarks={bookmarks}
            onBookmarksChange={setBookmarks}
          />

          <SendCookieSettings
            configs={sendCookieConfigs}
            onConfigsChange={setSendCookieConfigs}
          />
        </div>

        {/* Import/Export section */}
        <Separator />
        <div className="p-4">
          <ConfigImportExport
            currentConfig={{
              apiKey: yesCodeApiKey,
              showBalance,
              showCursorUsage,
              bookmarks,
            }}
            onImport={(config) => {
              setYesCodeApiKey(config.apiKey)
              setShowBalance(config.showBalance)
              setShowCursorUsage(config.showCursorUsage)
              setBookmarks(config.bookmarks)
            }}
          />
        </div>

        {/* Footer with actions */}
        <DrawerFooter className="border-t">
          <Button className="w-full" onClick={saveConfig} disabled={saving}>
            {saving ? "保存中..." : "保存设置"}
          </Button>
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancel}
              disabled={saving}
            >
              取消
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

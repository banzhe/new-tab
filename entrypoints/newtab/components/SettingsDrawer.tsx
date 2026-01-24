import { useRequest } from "ahooks"
import { Settings } from "lucide-react"
import { useState } from "react"
import { sendMessage } from "webext-bridge/content-script"
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
import type { Bookmark } from "@/types/messages"
import { BookmarkSettings } from "./BookmarkSettings"
import { ConfigImportExport } from "./ConfigImportExport"
import { CursorSettings } from "./CursorSettings"
import { MiniMaxSettings } from "./MiniMaxSettings"
import { SendCookieSettings } from "./SendCookieSettings"
import { YesCodeSettings } from "./YesCodeSettings"

export function SettingsDrawer() {
  const [open, setOpen] = useState(false)
  const [showBalance, setShowBalance] = useState(false)
  const [showCursorUsage, setShowCursorUsage] = useState(false)
  const [miniMaxApiKey, setMiniMaxApiKey] = useState("")
  const [showMiniMaxUsage, setShowMiniMaxUsage] = useState(false)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [sendCookieConfigs, setSendCookieConfigs] = useState<
    {
      id: string
      domain: string
      apiUrl: string
      interval: number
      enabled: boolean
    }[]
  >([])

  // Load config using useRequest
  const { refresh: reloadConfig } = useRequest(
    async () => {
      const [configResponse, sendCookieResponse, miniMaxResponse] =
        await Promise.all([
          sendMessage("getConfig", null, "background"),
          sendMessage("getSendCookieConfig", null, "background"),
          sendMessage("getMiniMaxConfig", null, "background"),
        ])

      if (configResponse.success && configResponse.data) {
        setShowBalance(configResponse.data.showBalance)
        setShowCursorUsage(configResponse.data.showCursorUsage)
        setBookmarks(configResponse.data.bookmarks || [])
      }

      if (sendCookieResponse.success && sendCookieResponse.data) {
        setSendCookieConfigs(sendCookieResponse.data)
      }

      if (miniMaxResponse.success && miniMaxResponse.data) {
        setMiniMaxApiKey(miniMaxResponse.data.apiKey)
        setShowMiniMaxUsage(miniMaxResponse.data.showUsage)
      }

      return { configResponse, sendCookieResponse, miniMaxResponse }
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
      const [configResponse, sendCookieResponse, miniMaxResponse] =
        await Promise.all([
          sendMessage(
            "saveConfig",
            {
              showBalance,
              showCursorUsage,
              bookmarks,
            },
            "background",
          ),
          sendMessage("saveSendCookieConfig", sendCookieConfigs, "background"),
          sendMessage(
            "saveMiniMaxConfig",
            {
              apiKey: miniMaxApiKey,
              showUsage: showMiniMaxUsage,
            },
            "background",
          ),
        ])

      if (!configResponse.success) {
        throw new Error(configResponse.error || "Failed to save config")
      }

      if (!sendCookieResponse.success) {
        throw new Error(
          sendCookieResponse.error || "Failed to save sendCookie config",
        )
      }

      if (!miniMaxResponse.success) {
        throw new Error(
          miniMaxResponse.error || "Failed to save MiniMax config",
        )
      }

      if (configResponse.success && sendCookieResponse.success) {
        setOpen(false)
        // Background script will automatically broadcast update notification
      }

      return { configResponse, sendCookieResponse, miniMaxResponse }
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
            showBalance={showBalance}
            onShowBalanceChange={setShowBalance}
          />

          <CursorSettings
            showCursorUsage={showCursorUsage}
            onShowCursorUsageChange={setShowCursorUsage}
          />

          <MiniMaxSettings
            apiKey={miniMaxApiKey}
            showUsage={showMiniMaxUsage}
            onApiKeyChange={setMiniMaxApiKey}
            onShowUsageChange={setShowMiniMaxUsage}
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
              showBalance,
              showCursorUsage,
              bookmarks,
            }}
            onImport={(config) => {
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

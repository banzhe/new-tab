import { useRequest } from "ahooks"
import { Settings } from "lucide-react"
import { useState } from "react"
import { sendMessage } from "webext-bridge/options"
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
import { MessageType } from "@/types/messages"
import { BookmarkSettings } from "./BookmarkSettings"
import { ConfigImportExport } from "./ConfigImportExport"
import { CursorSettings } from "./CursorSettings"
import { MiniMaxSettings } from "./MiniMaxSettings"
import { PackyCodexSettings } from "./PackyCodexSettings"
import { SendCookieSettings } from "./SendCookieSettings"
import { YesCodeSettings } from "./YesCodeSettings"

export function SettingsDrawer() {
  const [open, setOpen] = useState(false)
  const [showYesCodeUsage, setShowYesCodeUsage] = useState(false)
  const [showCursorUsage, setShowCursorUsage] = useState(false)
  const [showPackyCodexUsage, setShowPackyCodexUsage] = useState(false)
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

  const { refresh: reloadConfig, loading: loadingConfig } = useRequest(
    async () => {
      const response = await sendMessage(
        MessageType.GET_APP_CONFIG,
        null,
        "background",
      )

      if (response.success && response.data) {
        const config = response.data
        setShowYesCodeUsage(config.yesCode.showUsage)
        setShowCursorUsage(config.cursorSettings.showUsage)
        setShowPackyCodexUsage(config.packyCodex.showUsage)
        setBookmarks(config.bookmarks.items || [])
        setMiniMaxApiKey(config.miniMax.apiKey)
        setShowMiniMaxUsage(config.miniMax.showUsage)
        setSendCookieConfigs(config.sendCookie || [])
      }

      return response
    },
    {
      onError: (error) => {
        console.error("Failed to load config:", error)
      },
    },
  )

  const { loading: saving, run: saveConfig } = useRequest(
    async () => {
      const response = await sendMessage(
        MessageType.SAVE_APP_CONFIG,
        {
          yesCode: { showUsage: showYesCodeUsage },
          cursorSettings: { showUsage: showCursorUsage },
          packyCodex: { showUsage: showPackyCodexUsage },
          bookmarks: { items: bookmarks },
          sendCookie: sendCookieConfigs,
          miniMax: {
            apiKey: miniMaxApiKey,
            showUsage: showMiniMaxUsage,
          },
        },
        "background",
      )

      if (!response.success) {
        throw new Error(response.error || "Failed to save config")
      }

      setOpen(false)

      return response
    },
    {
      manual: true,
      onError: (error) => {
        console.error("Failed to save config:", error)
      },
    },
  )

  const handleCancel = () => {
    reloadConfig()
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
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
        <DrawerHeader>
          <DrawerTitle>设置</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <YesCodeSettings
            showUsage={showYesCodeUsage}
            onShowUsageChange={setShowYesCodeUsage}
          />

          <CursorSettings
            showUsage={showCursorUsage}
            onShowUsageChange={setShowCursorUsage}
          />

          <PackyCodexSettings
            showUsage={showPackyCodexUsage}
            onShowUsageChange={setShowPackyCodexUsage}
          />

          <MiniMaxSettings
            apiKey={miniMaxApiKey}
            showUsage={showMiniMaxUsage}
            onApiKeyChange={setMiniMaxApiKey}
            onShowUsageChange={setShowMiniMaxUsage}
          />

          <BookmarkSettings items={bookmarks} onItemsChange={setBookmarks} />

          <SendCookieSettings
            configs={sendCookieConfigs}
            onConfigsChange={setSendCookieConfigs}
          />
        </div>

        <Separator />
        <div className="p-4">
          <ConfigImportExport
            currentConfig={{
              yesCode: { showUsage: showYesCodeUsage },
              cursorSettings: { showUsage: showCursorUsage },
              packyCodex: { showUsage: showPackyCodexUsage },
              bookmarks: { items: bookmarks },
              sendCookie: sendCookieConfigs,
              miniMax: {
                apiKey: miniMaxApiKey,
                showUsage: showMiniMaxUsage,
              },
            }}
            onImport={(config) => {
              setShowYesCodeUsage(config.yesCode.showUsage)
              setShowCursorUsage(config.cursorSettings.showUsage)
              setShowPackyCodexUsage(config.packyCodex.showUsage)
              setBookmarks(config.bookmarks.items)
            }}
          />
        </div>

        <DrawerFooter className="border-t">
          <Button
            className="w-full"
            onClick={saveConfig}
            disabled={saving || loadingConfig}
          >
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

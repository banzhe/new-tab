import { AlertCircle, Download, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { validateConfig } from "@/lib/validation"
import type { AppConfig } from "@/types/messages"

interface ConfigImportExportProps {
  currentConfig: AppConfig
  onImport: (config: AppConfig) => void
}

export function ConfigImportExport({
  currentConfig,
  onImport,
}: ConfigImportExportProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [importData, setImportData] = useState<AppConfig | null>(null)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const json = JSON.stringify(currentConfig, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `tab-config-${new Date().toISOString().split("T")[0]}.json`
    a.click()

    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")

    if (file.size > 1024 * 1024) {
      setError("文件过大，最大支持 1MB")
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)

        const result = validateConfig(parsed)
        if (!result.valid || !result.sanitized) {
          setError(result.error || "配置验证失败")
          return
        }

        setImportData(result.sanitized)
        setShowPreview(true)
      } catch {
        setError("文件格式错误，请选择有效的 JSON 文件")
      }
    }

    reader.onerror = () => {
      setError("无法读取文件，请重试")
    }

    reader.readAsText(file)

    e.target.value = ""
  }

  const handleConfirmImport = () => {
    if (importData) {
      onImport(importData)
      setShowPreview(false)
      setImportData(null)
      setError("")
    }
  }

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-medium">数据管理</h3>

        <div className="flex gap-2">
          <div className="flex-1">
            <Button
              variant="outline"
              onClick={handleExport}
              className="w-full"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              导出配置
            </Button>
          </div>

          <div className="flex-1">
            <Button
              variant="outline"
              onClick={handleImport}
              className="w-full"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              导入配置
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {error && (
          <div className="text-destructive text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认导入配置</DialogTitle>
            <DialogDescription>以下配置将被应用到当前设置</DialogDescription>
          </DialogHeader>

          {importData && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">YesCode 显示:</span>
                <span>{importData.yesCode.showUsage ? "✓" : "✗"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cursor 显示:</span>
                <span>{importData.cursorSettings.showUsage ? "✓" : "✗"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PackyCodex 显示:</span>
                <span>{importData.packyCodex.showUsage ? "✓" : "✗"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">书签数量:</span>
                <span>{importData.bookmarks.items.length} 个</span>
              </div>
            </div>
          )}

          <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>导入后需要点击"保存设置"才会应用到系统</span>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmImport}>确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

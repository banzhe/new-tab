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
import type { YesCodeConfig } from "@/types/messages"

interface ConfigImportExportProps {
  currentConfig: YesCodeConfig
  onImport: (config: YesCodeConfig) => void
}

export function ConfigImportExport({
  currentConfig,
  onImport,
}: ConfigImportExportProps) {
  const [includeApiKey, setIncludeApiKey] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [importData, setImportData] = useState<YesCodeConfig | null>(null)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 处理配置导出
   */
  const handleExport = () => {
    // 根据选项决定是否包含 API Key
    const configToExport = includeApiKey
      ? currentConfig
      : { ...currentConfig, apiKey: "" }

    // 生成 JSON 字符串
    const json = JSON.stringify(configToExport, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // 创建隐藏的下载链接
    const a = document.createElement("a")
    a.href = url
    a.download = `tab-config-${new Date().toISOString().split("T")[0]}.json`
    a.click()

    // 清理 URL 对象
    URL.revokeObjectURL(url)
  }

  /**
   * 触发文件选择对话框
   */
  const handleImport = () => {
    fileInputRef.current?.click()
  }

  /**
   * 处理文件选择
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")

    // 文件大小限制 (1MB)
    if (file.size > 1024 * 1024) {
      setError("文件过大，最大支持 1MB")
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)

        // 验证配置格式
        const result = validateConfig(parsed)
        if (!result.valid) {
          setError(result.error || "配置验证失败")
          return
        }

        // 显示预览对话框
        // biome-ignore lint/style/noNonNullAssertion: result is valid
        setImportData(result.sanitized!)
        setShowPreview(true)
      } catch {
        setError("文件格式错误，请选择有效的 JSON 文件")
      }
    }

    reader.onerror = () => {
      setError("无法读取文件，请重试")
    }

    reader.readAsText(file)

    // 重置 input 以允许重复选择同一文件
    e.target.value = ""
  }

  /**
   * 确认导入配置
   */
  const handleConfirmImport = () => {
    if (importData) {
      onImport(importData)
      setShowPreview(false)
      setImportData(null)
      setError("")
    }
  }

  /**
   * 格式化 API Key 显示（脱敏）
   */
  const formatApiKey = (apiKey: string) => {
    if (!apiKey) return "(未设置)"
    if (apiKey.length <= 8) return "●".repeat(apiKey.length)
    return `${apiKey.slice(0, 4)}${"●".repeat(8)}${apiKey.slice(-4)}`
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

        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={includeApiKey}
            onChange={(e) => setIncludeApiKey(e.target.checked)}
            className="rounded"
          />
          导出时包含 API Key
        </label>

        {error && (
          <div className="text-destructive text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>

      {/* 预览对话框 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认导入配置</DialogTitle>
            <DialogDescription>以下配置将被应用到当前设置</DialogDescription>
          </DialogHeader>

          {importData && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Key:</span>
                <span className="font-mono text-xs">
                  {formatApiKey(importData.apiKey)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">显示余额:</span>
                <span>{importData.showBalance ? "✓" : "✗"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">显示 Cursor 用量:</span>
                <span>{importData.showCursorUsage ? "✓" : "✗"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">书签数量:</span>
                <span>{importData.bookmarks.length} 个</span>
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

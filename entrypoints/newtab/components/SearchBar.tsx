import { ArrowRight, Search } from "lucide-react"
import { type FormEvent, type KeyboardEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  placeholder?: string
  onSearch?: (query: string) => void
}

function SearchBar({
  className,
  placeholder = "搜索...",
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSearch = () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    if (onSearch) {
      onSearch(trimmedQuery)
    } else {
      // 默认使用 Google 搜索
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex w-full max-w-2xl items-center gap-2",
        className,
      )}
    >
      {/* 搜索图标 */}
      <div className="pointer-events-none absolute left-3 flex items-center">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>

      {/* 输入框 */}
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-10 pl-9 pr-10"
      />

      {/* 搜索按钮 */}
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute right-1 h-8 w-8"
        aria-label="搜索"
      >
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  )
}

export { SearchBar }

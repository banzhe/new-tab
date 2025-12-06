import type { Bookmark } from "@/types/messages"
import { cn } from "@/lib/utils"

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  className?: string
}

/**
 * 获取网站的 Favicon URL
 */
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return ""
  }
}

function BookmarkGrid({ bookmarks, className }: BookmarkGridProps) {
  if (bookmarks.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8",
        className,
      )}
    >
      {bookmarks.map((bookmark) => (
        <a
          key={bookmark.id}
          href={bookmark.url}
          className="group flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-accent"
          title={bookmark.url}
        >
          {/* Favicon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-transform group-hover:scale-110">
            <img
              src={getFaviconUrl(bookmark.url)}
              alt=""
              className="h-6 w-6"
              loading="lazy"
              onError={(e) => {
                // 加载失败时显示首字母
                const target = e.currentTarget
                target.style.display = "none"
                const parent = target.parentElement
                if (parent && !parent.querySelector("span")) {
                  const span = document.createElement("span")
                  span.className =
                    "text-lg font-medium text-muted-foreground uppercase"
                  span.textContent = bookmark.title.charAt(0) || "?"
                  parent.appendChild(span)
                }
              }}
            />
          </div>

          {/* 标题 */}
          <span className="w-full truncate text-center text-xs text-muted-foreground group-hover:text-foreground">
            {bookmark.title}
          </span>
        </a>
      ))}
    </div>
  )
}

export { BookmarkGrid }

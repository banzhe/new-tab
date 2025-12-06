import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { Bookmark } from "@/types/messages"

interface BookmarkSettingsProps {
  bookmarks: Bookmark[]
  onBookmarksChange: (bookmarks: Bookmark[]) => void
}

export function BookmarkSettings({
  bookmarks,
  onBookmarksChange,
}: BookmarkSettingsProps) {
  const addBookmark = () => {
    const newBookmark: Bookmark = {
      id: crypto.randomUUID(),
      title: "",
      url: "",
    }
    onBookmarksChange([...bookmarks, newBookmark])
  }

  const updateBookmark = (id: string, field: keyof Bookmark, value: string) => {
    onBookmarksChange(
      bookmarks.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    )
  }

  const removeBookmark = (id: string) => {
    onBookmarksChange(bookmarks.filter((b) => b.id !== id))
  }

  return (
    <FieldSet>
      <FieldLegend>快捷书签</FieldLegend>
      <FieldGroup>
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="flex items-center gap-2">
            <Input
              value={bookmark.title}
              onChange={(e) =>
                updateBookmark(bookmark.id, "title", e.target.value)
              }
              placeholder="标题"
              className="w-24"
            />
            <Input
              value={bookmark.url}
              onChange={(e) =>
                updateBookmark(bookmark.id, "url", e.target.value)
              }
              placeholder="网址 (https://...)"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeBookmark(bookmark.id)}
              aria-label="删除书签"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBookmark}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加书签
        </Button>
      </FieldGroup>
    </FieldSet>
  )
}

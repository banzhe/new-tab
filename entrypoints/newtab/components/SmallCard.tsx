import { ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SmallCard({
  title,
  children,
  loading,
  externalLink,
}: {
  title: string
  externalLink?: string
  children?: React.ReactNode
  loading?: boolean
}) {
  const handleClick = () => {
    if (externalLink) {
      window.open(externalLink, "_blank")
    }
  }

  return (
    <Card className="h-56 overflow-auto no-scroll">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {externalLink && (
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer w-3 h-3"
              onClick={handleClick}
            >
              <ExternalLinkIcon />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

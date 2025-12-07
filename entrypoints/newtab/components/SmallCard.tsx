import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SmallCard({
  title,
  children,
  loading,
}: {
  title: string
  children?: React.ReactNode
  loading?: boolean
}) {
  return (
    <Card className="h-56 overflow-auto no-scroll">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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

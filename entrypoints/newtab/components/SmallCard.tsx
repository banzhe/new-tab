import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SmallCard({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) {
  return (
    <Card className="h-56 overflow-auto no-scroll">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-full">{children}</CardContent>
    </Card>
  )
}

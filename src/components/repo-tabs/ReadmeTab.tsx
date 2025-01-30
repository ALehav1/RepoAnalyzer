import { Card, CardContent } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'

interface ReadmeTabProps {
  readme: string
}

export default function ReadmeTab({ readme }: ReadmeTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{readme}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}

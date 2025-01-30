import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ProgressTrackerProps {
  status: 'idle' | 'in_progress' | 'completed' | 'failed'
  progress: number
  error?: string
  title: string
  description?: string
  onComplete?: () => void
}

export function ProgressTracker({
  status,
  progress,
  error,
  title,
  description,
  onComplete
}: ProgressTrackerProps) {
  const [showProgress, setShowProgress] = useState(true)

  useEffect(() => {
    if (status === 'completed' && onComplete) {
      const timer = setTimeout(() => {
        setShowProgress(false)
        onComplete()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [status, onComplete])

  if (!showProgress) return null

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {status === 'in_progress' && <LoadingSpinner size="sm" />}
            {status === 'completed' && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            {status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
          </div>

          <Progress value={progress} className="w-full" />

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            {status === 'in_progress' && (
              <span>Estimated time: {Math.ceil((100 - progress) / 10)} min</span>
            )}
          </div>

          {status === 'failed' && error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

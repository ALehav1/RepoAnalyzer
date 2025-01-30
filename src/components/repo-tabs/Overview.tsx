import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { GitBranch, GitFork, Star, FileCode, Clock, Loader2 } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

interface ContributorInfo {
  username: string
  contributions: number
  avatar_url: string
  profile_url: string
}

interface ActivityItem {
  type: string
  title: string
  description: string
  author: string
  timestamp: string
  url: string
}

interface Repository {
  name: string
  url: string
  description: string | null
  stats: {
    files_count: number
    total_lines: number
    languages: { [key: string]: number }
    stars: number
    forks: number
    contributors: ContributorInfo[]
    recent_activity: ActivityItem[]
  } | null
  last_analyzed: string | null
}

interface OverviewProps {
  repository: Repository
}

export default function Overview({ repository }: OverviewProps) {
  if (!repository.stats) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalLines = repository.stats.total_lines.toLocaleString()
  const languages = Object.entries(repository.stats.languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Key metrics about the repository</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Lines of Code</p>
                <p className="text-2xl font-bold">{totalLines}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Stars</p>
                <p className="text-2xl font-bold">{repository.stats.stars}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <GitFork className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Forks</p>
                <p className="text-2xl font-bold">{repository.stats.forks}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Analyzed</p>
                <p className="text-sm">
                  {repository.last_analyzed
                    ? new Date(repository.last_analyzed).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Languages</CardTitle>
          <CardDescription>Most used programming languages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {languages.map(([language, lines]) => {
              const percentage = ((lines / repository.stats.total_lines) * 100).toFixed(1)
              return (
                <div key={language}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{language}</span>
                    <span className="text-muted-foreground">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contributors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>Most active repository contributors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {repository.stats.contributors.slice(0, 5).map((contributor) => (
              <div key={contributor.username} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.username}
                    className="h-8 w-8 rounded-full"
                  />
                  <a
                    href={contributor.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline"
                  >
                    {contributor.username}
                  </a>
                </div>
                <span className="text-sm text-muted-foreground">
                  {contributor.contributions} commits
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest repository updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {repository.stats.recent_activity.slice(0, 5).map((activity, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={activity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline"
                  >
                    {activity.title}
                  </a>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  by {activity.author} • {activity.timestamp}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

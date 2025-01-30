import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { GitBranch, MessageSquare, Star, BookOpen } from 'lucide-react'

export function Navigation() {
  const location = useLocation()

  const navigation = [
    {
      name: 'Load Repository',
      href: '/',
      icon: GitBranch,
      current: location.pathname === '/',
    },
    {
      name: 'Saved Repositories',
      href: '/saved',
      icon: Star,
      current: location.pathname === '/saved',
    },
    {
      name: 'Global Chat',
      href: '/chat',
      icon: MessageSquare,
      current: location.pathname === '/chat',
    },
    {
      name: 'Best Practices',
      href: '/practices',
      icon: BookOpen,
      current: location.pathname === '/practices',
    },
  ]

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              RepoAnalyzer
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={item.current ? 'default' : 'ghost'}
                asChild
              >
                <Link to={item.href} className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

import { ReactNode } from 'react'
import { Navigation } from './navigation'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8 px-4">{children}</main>
    </div>
  )
}

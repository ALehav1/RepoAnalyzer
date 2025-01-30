import { useState } from 'react'
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'

interface FileTreeProps {
  repository: any // TODO: Add proper type
}

interface TreeItem {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: TreeItem[]
}

export function FileTree({ repository }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded)
    if (expanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpanded(newExpanded)
  }

  const renderTreeItem = (item: TreeItem, level: number = 0) => {
    const isExpanded = expanded.has(item.path)
    const hasChildren = item.type === 'directory' && item.children && item.children.length > 0

    return (
      <div key={item.path}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start px-2 hover:bg-accent',
            level > 0 && 'ml-4'
          )}
          onClick={() => hasChildren && toggleExpand(item.path)}
        >
          <span className="flex items-center">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )
            ) : (
              <File className="h-4 w-4 shrink-0" />
            )}
            <span className="ml-2 truncate">{item.name}</span>
          </span>
        </Button>
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {item.children!.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="p-2">
        <h4 className="mb-4 text-sm font-medium">Repository Structure</h4>
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
          {repository.files ? (
            repository.files.map((item: TreeItem) => renderTreeItem(item))
          ) : (
            <div className="text-sm text-muted-foreground">No files available</div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

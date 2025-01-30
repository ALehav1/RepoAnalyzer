import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileInfo {
  path: string
  type: string
  size: number
  language: string | null
  lastModified: string
  children?: FileInfo[]
  preview?: string
}

interface FilesTabProps {
  structure: FileInfo[]
}

interface FileTreeItemProps {
  item: FileInfo
  level: number
  onSelect: (file: FileInfo) => void
}

function FileTreeItem({ item, level, onSelect }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = item.type === 'directory' && item.children && item.children.length > 0
  const Icon = item.type === 'directory' ? Folder : File
  const ChevronIcon = isOpen ? ChevronDown : ChevronRight

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen)
    } else {
      onSelect(item)
    }
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center py-1 px-2 hover:bg-accent rounded-lg cursor-pointer',
          'transition-colors duration-200'
        )}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={handleClick}
      >
        <div className="flex items-center flex-1 space-x-2">
          {hasChildren ? (
            <ChevronIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <span className="w-4" />
          )}
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm truncate">{item.path.split('/').pop()}</span>
        </div>
        {item.type === 'file' && (
          <span className="text-xs text-muted-foreground">
            {formatFileSize(item.size)}
          </span>
        )}
      </div>
      {hasChildren && isOpen && (
        <div>
          {item.children!.map((child) => (
            <FileTreeItem
              key={child.path}
              item={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function FilePreview({ file }: { file: FileInfo }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{file.path.split('/').pop()}</h3>
        <span className="text-sm text-muted-foreground">
          {new Date(file.lastModified).toLocaleDateString()}
        </span>
      </div>
      {file.preview && (
        <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
          <code>{file.preview}</code>
        </pre>
      )}
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <span>{formatFileSize(file.size)}</span>
        {file.language && <span>{file.language}</span>}
      </div>
    </div>
  )
}

export default function FilesTab({ structure }: FilesTabProps) {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-1">
            {structure.map((item) => (
              <FileTreeItem
                key={item.path}
                item={item}
                level={0}
                onSelect={setSelectedFile}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          {selectedFile ? (
            <FilePreview file={selectedFile} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a file to view its details
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

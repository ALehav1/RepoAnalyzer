import { FileCode, FolderTree, CheckCircle2 } from 'lucide-react'

interface FileStructure {
  name: string
  path: string
  type: 'file' | 'dir'
  content?: string
  children?: FileStructure[]
}

interface FileTreeItemProps {
  item: FileStructure
  selectedFile: string | null
  fileExplanations: Record<string, string>
  onSelect: (path: string) => void
  level?: number
}

export const FileTreeItem = ({ 
  item, 
  selectedFile, 
  fileExplanations, 
  onSelect,
  level = 0 
}: FileTreeItemProps) => {
  return (
    <li>
      <button
        onClick={() => onSelect(item.path)}
        className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground w-full text-left group ${
          selectedFile === item.path ? 'bg-accent text-accent-foreground' : ''
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          {item.type === 'dir' ? (
            <FolderTree className="w-4 h-4" />
          ) : (
            <FileCode className="w-4 h-4" />
          )}
          <span className="truncate">{item.name}</span>
        </div>
        {item.type === 'file' && fileExplanations[item.path] && (
          <CheckCircle2 
            className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" 
            title="File analyzed"
          />
        )}
      </button>
      {item.type === 'dir' && item.children && item.children.length > 0 && (
        <ul className="ml-4 space-y-1">
          {item.children.map(child => (
            <FileTreeItem
              key={child.path}
              item={child}
              selectedFile={selectedFile}
              fileExplanations={fileExplanations}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

interface FileTreeProps {
  items: FileStructure[]
  selectedFile: string | null
  fileExplanations: Record<string, string>
  onSelect: (path: string) => void
}

export const FileTree = ({ items, selectedFile, fileExplanations, onSelect }: FileTreeProps) => {
  return (
    <ul className="space-y-1">
      {items.map(item => (
        <FileTreeItem
          key={item.path}
          item={item}
          selectedFile={selectedFile}
          fileExplanations={fileExplanations}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}

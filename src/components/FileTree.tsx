import React, { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaPython } from 'react-icons/fa';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { useAnalysisContext } from '../context/AnalysisContext'

interface FileTreeProps {
  repository: any // TODO: Add proper type
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export function FileTree({ repository }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const { setSelectedFile } = useAnalysisContext()

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expanded)
    if (expanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpanded(newExpanded)
  }

  const handleFileSelect = (item: FileNode) => {
    if (item.type === 'file' && item.path.endsWith('.py')) {
      setSelectedFile(item.path)
    }
  }

  const renderNode = (node: FileNode, level: number = 0) => {
    const isPython = node.name.endsWith('.py');
    const isExpanded = expanded.has(node.path);
    const hasChildren = node.type === 'directory' && node.children && node.children.length > 0

    return (
      <div key={node.path}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start px-2 hover:bg-accent',
            level > 0 && 'ml-4',
            isPython ? 'text-blue-600' : ''
          )}
          onClick={() => {
            if (node.type === 'directory') {
              toggleDirectory(node.path)
            } else if (isPython) {
              handleFileSelect(node)
            }
          }}
        >
          <span className="flex items-center">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )
            ) : isPython ? (
              <FaPython />
            ) : (
              <File className="h-4 w-4 shrink-0" />
            )}
            <span className="ml-2">{node.name}</span>
          </span>
        </Button>
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-64 border-r">
      <div className="p-2">
        <h2 className="mb-4 px-2 text-lg font-semibold">Repository Files</h2>
        {repository.files && repository.files.map((item: FileNode) => renderNode(item))}
      </div>
    </ScrollArea>
  )
}

export function getFileExtension(filePath: string): string {
  if (!filePath) return 'plaintext';
  
  const parts = filePath.split('.');
  if (parts.length <= 1) return 'plaintext';
  
  const extension = parts[parts.length - 1].toLowerCase();
  
  // Map common extensions to their language
  const extensionMap: Record<string, string> = {
    // JavaScript/TypeScript
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    
    // Python
    'py': 'python',
    'ipynb': 'python',
    
    // Web
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    
    // Data formats
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    
    // Documentation
    'md': 'markdown',
    'markdown': 'markdown',
    
    // Shell
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    
    // Other languages
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'rb': 'ruby',
    'php': 'php',
  };
  
  return extensionMap[extension] || 'plaintext';
}

export function isTextFile(filePath: string): boolean {
  const textExtensions = [
    // Code
    'js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'scss', 'less',
    'json', 'yaml', 'yml', 'xml', 'md', 'markdown', 'sh', 'bash',
    'go', 'rs', 'java', 'cpp', 'c', 'cs', 'rb', 'php',
    
    // Config
    'env', 'gitignore', 'dockerignore', 'ini', 'conf', 'config',
    
    // Data
    'csv', 'tsv', 'txt',
    
    // Documentation
    'rst', 'adoc', 'textile',
  ];
  
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  return textExtensions.includes(extension);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

# GitHub Repository Analyzer

A powerful AI-powered tool for analyzing GitHub repositories, providing deep insights, and enabling interactive exploration of codebases. Built with React, TypeScript, and OpenAI's GPT-4, this application helps developers understand, compare, and learn from different repositories through automated analysis and pattern detection.

## 🌟 Features and Implementation

### 1. Core Architecture

#### State Management (`AppContext.tsx`)
- **Global State**: Uses React Context for managing application-wide state
- **State Structure**:
  - Repository metadata and analysis results
  - File structure and content cache
  - Analysis explanations and chat history
  - Loading and error states
- **Auto-save System**:
  - Debounced saves (1-second delay)
  - Incremental updates for file content and analysis
  - State merging to preserve existing data
  - Visual feedback for save operations

#### File System (`localStorageManager.ts`)
- **Storage Format**: JSON-based storage with compression
- **Data Structure**:
  ```typescript
  interface SavedRepo {
    url: string;
    name: string;
    analysis: AnalysisState;
    fileStructure: FileStructure[];
    fileExplanations: Record<string, string>;
    chatMessages: ChatMessage[];
    savedAt: string;
    fullRepoContent?: RepoContentState;
  }
  ```
- **Save Operations**:
  - Full repository saves
  - Incremental file content updates
  - Analysis caching
  - Chat history preservation

### 2. User Interface Components

#### Repository Overview
- **Implementation**: React components with Tailwind CSS
- **Features**:
  - Repository metadata display
  - Language statistics
  - Star and fork counts
  - Creation and update timestamps
  - License information

#### File Explorer
- **Tree Structure**:
  - Recursive rendering of directories
  - Lazy loading of file contents
  - Progress indicators for loading states
  - Analysis status badges
- **Content Display**:
  - Syntax highlighting for code
  - Size-aware loading for large files
  - Error handling for failed loads
  - Reanalysis capability

#### Documentation View
- **Markdown Rendering**:
  - Custom ReactMarkdown components
  - Image path resolution for GitHub content
  - Syntax highlighting for code blocks
  - Responsive layout handling
- **Component Structure**:
  ```typescript
  components={{
    img: ({alt, src}) => <CustomImage />,
    a: ({href, children}) => <CustomLink />,
    code: ({children}) => <CodeBlock />,
    pre: ({children}) => <PreformattedBlock />
  }}
  ```

### 3. Analysis System

#### File Analysis
- **Process**:
  1. Content loading from GitHub API
  2. GPT-4 analysis generation
  3. Result caching and storage
  4. UI updates with new analysis
- **Implementation**:
  ```typescript
  const reanalyzeFile = async (path: string) => {
    // Load file content
    // Generate analysis using GPT-4
    // Update state and storage
    // Handle errors and loading states
  };
  ```

#### Content Management
- **Loading Strategy**:
  - On-demand file loading
  - Content caching in memory
  - Persistent storage in localStorage
  - Auto-save on content changes
- **Error Handling**:
  - GitHub API rate limits
  - Network failures
  - Invalid file types
  - Size limitations

### 4. Setup and Configuration

#### Prerequisites
- Node.js 16 or higher
- npm or yarn
- OpenAI API key
- GitHub personal access token

#### Environment Variables
```env
VITE_OPENAI_API_KEY=your_api_key_here
VITE_GITHUB_TOKEN=your_github_token_here
```

#### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file with required keys
4. Start development server:
   ```bash
   npm run dev
   ```

### 5. Technical Decisions

#### React + TypeScript
- Strong typing for better maintainability
- Component reusability
- Enhanced development experience
- Better error catching at compile time

#### Vite
- Fast development server
- Efficient build process
- Modern module system
- Better dependency handling

#### Tailwind CSS
- Utility-first approach
- Consistent styling
- Responsive design
- Dark mode support

#### Local Storage
- Offline capability
- Faster access to saved data
- Reduced API calls
- Better user experience

### 6. Future Improvements

1. **Performance**
   - Implement virtual scrolling for large files
   - Add worker threads for heavy computations
   - Optimize state updates

2. **Features**
   - Add diff view for file changes
   - Implement repository comparison
   - Add code search functionality
   - Support for private repositories

3. **Analysis**
   - Add more detailed code pattern detection
   - Implement security vulnerability scanning
   - Add performance analysis
   - Support more file types

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
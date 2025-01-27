# GitHub Repository Analyzer

A powerful AI-powered tool for analyzing GitHub repositories, providing deep insights, and enabling interactive exploration of codebases. Built with React, TypeScript, and OpenAI's GPT-4, this application helps developers understand, compare, and learn from different repositories through automated analysis and pattern detection.

## 🌟 Key Features

### 1. Repository Analysis
- **Quick Analysis**: Instantly analyze any public GitHub repository
- **File Structure Exploration**: Browse and understand the repository's structure
- **Code Explanations**: Get AI-powered explanations for each file
- **Critical Analysis**: Receive comprehensive architectural insights
- **Interactive Chat**: Ask questions about any aspect of the repository
- **Local Storage**: Save analyzed repositories for offline access
- **Pattern Detection**: Identify and compare code patterns across repositories

### 2. Analysis Views

#### Overview Tab
- Repository metadata display (stars, forks, creation date)
- Language breakdown visualization
- Repository description and key metrics
- Quick access to important repository links
- Status indicators for analysis progress

#### Documentation Tab
- Rendered README display with full Markdown support
- Proper image handling with GitHub raw content fallback
- Syntax highlighting for code blocks
- Responsive layout with proper spacing
- External link handling with security attributes

#### File Explorer Tab
- Interactive file tree navigation with directory collapsing
- Smart file content loading with size limits
- On-demand loading for large files
- AI-powered file explanations with caching
- Syntax highlighting for code display
- File reanalysis capability
- Progress indicators for analysis status

#### Full Repository Tab
- Complete codebase view with syntax highlighting
- Large file handling with size warnings
- Copy functionality for code snippets
- Efficient content generation with caching
- Loading states and error handling

#### Critical Analysis Tab
- Comprehensive architectural analysis
- Code organization assessment
- Best practices evaluation
- Implementation details review
- Learning points and takeaways
- Improvement suggestions
- Cache-aware generation

#### Chat Tab
- Interactive Q&A about the repository
- Context-aware responses using repository data
- Code-specific question handling
- Implementation inquiries
- Pattern explanations
- Message history preservation
- Loading states for responses

### 3. Technical Architecture

#### Core Components
- **App.tsx**: Main application layout and routing
- **AppContext.tsx**: Global state management and core functionality
- **Components/**: Reusable UI components
- **Utils/**: Helper functions and services

#### State Management
- React Context for global state
- Local state for component-specific data
- Ref-based state for certain operations
- Proper cleanup and error handling

#### Data Flow
1. Repository URL input and validation
2. Initial metadata fetch and validation
3. File structure generation
4. Content analysis and caching
5. State updates and persistence

### 4. Save System

#### Save Mechanism
- **Initial Save**:
  - Triggered after repository validation
  - Saves basic metadata and file structure
  - Creates entry in saved repositories list

- **Incremental Updates**:
  - File explanations saved upon generation
  - Critical analysis saved when completed
  - Chat messages saved as they're added
  - Full repository content saved when generated

- **Cache Management**:
  - Checks existing cache before new analysis
  - Preserves file contents across sessions
  - Smart merging of new and cached data

- **Save Control**:
  - No automatic state-based saves
  - Explicit saves at key points:
    1. After initial repository validation
    2. When generating file explanations
    3. Upon critical analysis completion
    4. After chat message generation
    5. When full repository content is generated

#### Data Structure
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

### 5. Settings and Configuration

#### File Size Management
- Configurable file size limits
- Large file handling options
- On-demand loading for oversized files

#### API Configuration
- OpenAI API key management
- GitHub API integration
- Rate limiting handling
- Error management

#### Local Storage
- Repository data persistence
- Export/Import functionality
- Storage space management
- Data cleanup options

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- OpenAI API key
- GitHub Personal Access Token (optional, for higher rate limits)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   VITE_GITHUB_TOKEN=your_github_token_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables
- `VITE_OPENAI_API_KEY`: Your OpenAI API key
- `VITE_GITHUB_TOKEN`: GitHub Personal Access Token (optional)

## 🔧 Development

### Project Structure
```
src/
├── components/        # React components
├── context/          # Global state management
├── hooks/            # Custom React hooks
├── utils/            # Helper functions
├── types.ts          # TypeScript types
└── App.tsx           # Main application
```

### Key Technologies
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- OpenAI API for analysis
- GitHub API for repository data
- LocalStorage for persistence

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
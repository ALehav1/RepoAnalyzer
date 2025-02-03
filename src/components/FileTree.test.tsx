import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileTree } from './FileTree';
import { AnalysisProvider } from '../context/AnalysisContext';

const mockRepository = {
  files: [
    {
      name: 'src',
      path: '/repo/src',
      type: 'directory',
      children: [
        {
          name: 'main.py',
          path: '/repo/src/main.py',
          type: 'file',
        },
        {
          name: 'utils',
          path: '/repo/src/utils',
          type: 'directory',
          children: [
            {
              name: 'helpers.py',
              path: '/repo/src/utils/helpers.py',
              type: 'file',
            },
          ],
        },
      ],
    },
    {
      name: 'test.txt',
      path: '/repo/test.txt',
      type: 'file',
    },
  ],
};

describe('FileTree', () => {
  it('renders repository structure correctly', () => {
    render(
      <AnalysisProvider>
        <FileTree repository={mockRepository} />
      </AnalysisProvider>
    );

    expect(screen.getByText('Repository Files')).toBeInTheDocument();
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('expands and collapses directories', () => {
    render(
      <AnalysisProvider>
        <FileTree repository={mockRepository} />
      </AnalysisProvider>
    );

    // Initially, main.py should not be visible
    expect(screen.queryByText('main.py')).not.toBeInTheDocument();

    // Click to expand src directory
    fireEvent.click(screen.getByText('src'));

    // Now main.py should be visible
    expect(screen.getByText('main.py')).toBeInTheDocument();

    // Click to collapse src directory
    fireEvent.click(screen.getByText('src'));

    // main.py should be hidden again
    expect(screen.queryByText('main.py')).not.toBeInTheDocument();
  });

  it('highlights Python files', () => {
    render(
      <AnalysisProvider>
        <FileTree repository={mockRepository} />
      </AnalysisProvider>
    );

    // Expand src directory
    fireEvent.click(screen.getByText('src'));

    // Check that main.py has the Python file color class
    const pythonFile = screen.getByText('main.py').closest('button');
    expect(pythonFile).toHaveClass('text-blue-600');

    // Check that test.txt doesn't have the Python file color class
    const textFile = screen.getByText('test.txt').closest('button');
    expect(textFile).not.toHaveClass('text-blue-600');
  });

  it('selects only Python files', () => {
    const { container } = render(
      <AnalysisProvider>
        <FileTree repository={mockRepository} />
      </AnalysisProvider>
    );

    // Expand src directory
    fireEvent.click(screen.getByText('src'));

    // Click on main.py
    fireEvent.click(screen.getByText('main.py'));

    // Click on test.txt
    fireEvent.click(screen.getByText('test.txt'));

    // Check that only one file was selected (the Python file)
    const selectedFiles = container.getElementsByClassName('text-blue-600');
    expect(selectedFiles.length).toBe(1);
  });
});

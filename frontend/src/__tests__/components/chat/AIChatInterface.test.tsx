import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIChatInterface from '../../../components/chat/AIChatInterface';

describe('AIChatInterface', () => {
  const mockRepoName = 'test-repo';

  beforeEach(() => {
    render(<AIChatInterface repoName={mockRepoName} />);
  });

  it('renders initial welcome message', () => {
    expect(screen.getByText(/Hi! I'm your AI assistant/)).toBeInTheDocument();
    expect(screen.getByText(mockRepoName)).toBeInTheDocument();
  });

  it('allows sending messages', async () => {
    const input = screen.getByPlaceholderText(/Ask about the codebase/i);
    const message = 'How can I improve this code?';

    fireEvent.change(input, { target: { value: message } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument();
      expect(screen.getByText(/AI is typing/)).toBeInTheDocument();
    });
  });

  it('handles empty messages', () => {
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    const messages = screen.getAllByRole('article');
    expect(messages).toHaveLength(1); // Only welcome message
  });

  it('displays code blocks correctly', async () => {
    const input = screen.getByPlaceholderText(/Ask about the codebase/i);
    fireEvent.change(input, { target: { value: 'Show me an example' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByText(/factory pattern/i)).toBeInTheDocument();
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock).toHaveTextContent(/class ComponentFactory/);
    });
  });

  it('shows correct message timestamps', () => {
    const timestamps = screen.getAllByText(/:\d{2}$/);
    expect(timestamps.length).toBeGreaterThan(0);
    
    const timestamp = timestamps[0];
    expect(timestamp.textContent).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  it('handles Enter key press', () => {
    const input = screen.getByPlaceholderText(/Ask about the codebase/i);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('clears input after sending message', async () => {
    const input = screen.getByPlaceholderText(/Ask about the codebase/i);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});

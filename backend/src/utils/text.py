"""Text processing utility functions."""

def estimate_tokens(text: str) -> int:
    """Rough estimate of token count for OpenAI models.
    
    Args:
        text: Input text
        
    Returns:
        int: Estimated token count
    """
    # Rough estimate based on GPT tokenization patterns
    return len(text.split()) + len(text) // 4

def truncate_for_model(text: str, max_tokens: int = 4000) -> str:
    """Truncate text to fit within model token limit.
    
    Args:
        text: Input text
        max_tokens: Maximum number of tokens allowed
        
    Returns:
        str: Truncated text
    """
    current_tokens = estimate_tokens(text)
    if current_tokens <= max_tokens:
        return text
        
    # Simple truncation strategy - could be improved
    ratio = max_tokens / current_tokens
    return text[:int(len(text) * ratio)]

"""Tests for edge cases in the best practices analyzer service."""
import pytest
from pathlib import Path
from src.services.best_practices_analyzer import BestPracticesAnalyzer, CodePattern

@pytest.fixture
def test_repo_dir(tmp_path):
    """Create a temporary repository directory with test files."""
    repo_dir = tmp_path / "test_repo"
    repo_dir.mkdir()
    return repo_dir

@pytest.mark.asyncio
async def test_analyze_invalid_python_file(test_repo_dir):
    """Test handling of invalid Python syntax."""
    invalid_file = test_repo_dir / "invalid.py"
    invalid_file.write_text('''
    def this_is_invalid_python:
        print("Missing parentheses"
        if True
            return None
    ''')

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should not crash and should return valid report
    assert report.patterns == []
    assert len(report.recommendations) > 0
    assert any("syntax errors" in r.lower() for r in report.recommendations)

@pytest.mark.asyncio
async def test_analyze_very_large_file(test_repo_dir):
    """Test handling of very large Python files."""
    large_file = test_repo_dir / "large.py"
    
    # Create a large file with repeated patterns
    content = '''
class LargeClass:
    def __init__(self):
        self._cache = {}
    
    def method_{i}(self):
        """Method {i} documentation."""
        return self._cache.get({i}, None)
'''
    large_content = "".join(content.format(i=i) for i in range(1000))
    large_file.write_text(large_content)

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should handle large files efficiently
    assert len(report.patterns) > 0
    assert any(p.name == "caching" for p in report.patterns)
    assert any("large file" in r.lower() for r in report.recommendations)

@pytest.mark.asyncio
async def test_analyze_deeply_nested_code(test_repo_dir):
    """Test handling of deeply nested code structures."""
    nested_file = test_repo_dir / "nested.py"
    nested_file.write_text('''
class OuterClass:
    class MiddleClass:
        class InnerClass:
            class DeeplyNested:
                def __init__(self):
                    self.value = None
                
                def nested_method(self):
                    def inner_function():
                        def deeper_function():
                            return lambda x: x + 1
                        return deeper_function()
                    return inner_function()
''')

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should detect nested structures
    assert len(report.patterns) > 0
    assert any("deep nesting" in r.lower() for r in report.recommendations)

@pytest.mark.asyncio
async def test_analyze_circular_dependencies(test_repo_dir):
    """Test handling of circular dependencies."""
    file_a = test_repo_dir / "module_a.py"
    file_b = test_repo_dir / "module_b.py"
    
    file_a.write_text('''
from module_b import ClassB

class ClassA:
    def __init__(self):
        self.b = ClassB()
''')
    
    file_b.write_text('''
from module_a import ClassA

class ClassB:
    def __init__(self):
        self.a = ClassA()
''')

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should detect circular dependencies
    assert any(p.name == "circular_dependency" for p in report.patterns)
    assert any("circular" in r.lower() for r in report.recommendations)

@pytest.mark.asyncio
async def test_analyze_mixed_language_files(test_repo_dir):
    """Test handling of mixed language content in Python files."""
    mixed_file = test_repo_dir / "mixed.py"
    mixed_file.write_text('''
# Python code
def process_data():
    return "processed"

# Embedded JavaScript
JS_CODE = """
function processData() {
    return "processed";
}
"""

# Embedded SQL
SQL_QUERY = """
SELECT *
FROM users
WHERE id = 1;
"""

# Embedded HTML
HTML_TEMPLATE = """
<div class="container">
    <h1>Title</h1>
</div>
"""
''')

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should handle mixed content appropriately
    assert len(report.patterns) > 0
    assert any("mixed language" in r.lower() for r in report.recommendations)

@pytest.mark.asyncio
async def test_analyze_unicode_and_special_chars(test_repo_dir):
    """Test handling of Unicode and special characters."""
    unicode_file = test_repo_dir / "unicode.py"
    unicode_file.write_text('''
def process_unicode_text():
    """处理Unicode文本."""
    text = "Hello, 世界! 🌍"
    return f"Processed: {text}"

class 中文类名:
    def __init__(self):
        self.value = "value"
    
    def 方法名(self):
        return self.value
''')

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should handle Unicode content
    assert len(report.patterns) > 0
    assert any(p.name == "internationalization" for p in report.patterns)

@pytest.mark.asyncio
async def test_analyze_commented_code(test_repo_dir):
    """Test handling of commented-out code."""
    commented_file = test_repo_dir / "commented.py"
    commented_file.write_text('''
def active_function():
    return "active"

# def commented_function():
#     return "commented"

"""
def docstring_function():
    return "docstring"
"""

# class CommentedClass:
#     def __init__(self):
#         self.value = None
#
#     def method(self):
#         return self.value
''')

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should detect commented code
    assert any(p.name == "commented_code" for p in report.patterns)
    assert any("commented" in r.lower() for r in report.recommendations)

@pytest.mark.asyncio
async def test_analyze_code_duplication(test_repo_dir):
    """Test handling of duplicated code."""
    file1 = test_repo_dir / "module1.py"
    file2 = test_repo_dir / "module2.py"
    
    duplicate_code = '''
def process_data(data):
    result = []
    for item in data:
        if item.is_valid:
            processed = item.value.upper()
            if processed not in result:
                result.append(processed)
    return sorted(result)
'''
    
    file1.write_text(duplicate_code)
    file2.write_text(duplicate_code)

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should detect code duplication
    assert any(p.name == "code_duplication" for p in report.patterns)
    assert any("duplication" in r.lower() for r in report.recommendations)

@pytest.mark.asyncio
async def test_analyze_dead_code(test_repo_dir):
    """Test handling of dead code."""
    dead_code_file = test_repo_dir / "dead_code.py"
    dead_code_file.write_text('''
def used_function():
    return "used"

def unused_function():
    return "never called"

class UnusedClass:
    def __init__(self):
        pass

UNUSED_CONSTANT = "never referenced"

def main():
    return used_function()

if __name__ == "__main__":
    main()
''')

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should detect dead code
    assert any(p.name == "dead_code" for p in report.patterns)
    assert any("unused" in r.lower() for r in report.recommendations)

@pytest.mark.asyncio
async def test_analyze_memory_patterns(test_repo_dir):
    """Test handling of memory-related patterns."""
    memory_file = test_repo_dir / "memory.py"
    memory_file.write_text('''
class MemoryLeakExample:
    _cache = {}  # Class-level cache without size limit
    
    def process(self, key, value):
        self._cache[key] = value  # Potential memory leak
        
    def large_list_operation(self):
        return [x for x in range(1000000)]  # Large memory allocation

class ResourceManager:
    def __init__(self):
        self.resources = []
    
    def __del__(self):
        self.cleanup()  # Proper cleanup
    
    def cleanup(self):
        for resource in self.resources:
            resource.close()
''')

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should detect memory patterns
    assert any(p.name == "memory_management" for p in report.patterns)
    assert any("memory" in r.lower() for r in report.recommendations)

@pytest.mark.asyncio
async def test_analyze_error_handling(test_repo_dir):
    """Test handling of error handling patterns."""
    error_file = test_repo_dir / "error_handling.py"
    error_file.write_text('''
def bare_except():
    try:
        process_data()
    except:  # Bad practice
        pass

def specific_except():
    try:
        process_data()
    except ValueError as e:  # Good practice
        log_error(e)
        raise

def mixed_except():
    try:
        process_data()
    except ValueError:
        handle_value_error()
    except:  # Mixed good and bad practices
        handle_unknown_error()
''')

    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Should detect error handling patterns
    assert any(p.name == "error_handling" for p in report.patterns)
    assert any("except" in r.lower() for r in report.recommendations)

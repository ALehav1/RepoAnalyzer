/**
 * Validates a GitHub repository URL.
 * Valid format: https://github.com/username/repository
 */
export const validateGitHubUrl = (url: string): boolean => {
  const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
  return githubUrlPattern.test(url.trim());
};

/**
 * Validates if a string is a valid semantic version.
 * Valid format: x.y.z where x, y, z are numbers
 */
export const validateSemanticVersion = (version: string): boolean => {
  const semverPattern = /^\d+\.\d+\.\d+$/;
  return semverPattern.test(version.trim());
};

/**
 * Validates if a string is a valid file path.
 * Checks for common invalid characters and patterns.
 */
export const validateFilePath = (path: string): boolean => {
  const invalidChars = /[<>:"|?*\x00-\x1F]/;
  return !invalidChars.test(path) && path.trim().length > 0;
};

/**
 * Validates if a string is a valid programming language name.
 * Includes common programming languages.
 */
export const validateLanguage = (language: string): boolean => {
  const validLanguages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'c++',
    'c#',
    'ruby',
    'go',
    'rust',
    'php',
  ];
  return validLanguages.includes(language.toLowerCase().trim());
};

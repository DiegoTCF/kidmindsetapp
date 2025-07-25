// Input validation utilities for security

/**
 * Sanitizes text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates text length and content
 */
export function validateTextInput(input: string, maxLength: number = 255): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!input || input.trim().length === 0) {
    return { isValid: false, sanitized: '', error: 'Input cannot be empty' };
  }
  
  if (input.length > maxLength) {
    return { 
      isValid: false, 
      sanitized: '', 
      error: `Input too long. Maximum ${maxLength} characters allowed.` 
    };
  }
  
  const sanitized = sanitizeText(input);
  return { isValid: true, sanitized };
}

/**
 * Validates numeric input
 */
export function validateNumericInput(input: number, min?: number, max?: number): {
  isValid: boolean;
  error?: string;
} {
  if (isNaN(input)) {
    return { isValid: false, error: 'Must be a valid number' };
  }
  
  if (min !== undefined && input < min) {
    return { isValid: false, error: `Must be at least ${min}` };
  }
  
  if (max !== undefined && input > max) {
    return { isValid: false, error: `Must be at most ${max}` };
  }
  
  return { isValid: true };
}